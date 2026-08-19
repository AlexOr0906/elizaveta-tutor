import { cp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "docs");
const output = path.join(root, "timeweb-site");

await rm(output, { recursive: true, force: true });
await cp(source, output, { recursive: true });
await cp(path.join(root, "timeweb-backend"), output, { recursive: true });
await rm(path.join(output, ".private", "config.php"), { force: true });
await cp(
  path.join(root, "scripts", "github-pages-runtime.js"),
  path.join(output, "assets", "pages-runtime.js"),
);
await rm(path.join(output, ".nojekyll"), { force: true });
await rm(path.join(output, "future-features.md"), { force: true });

async function rewriteHtml(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await rewriteHtml(target);
    } else if (entry.name.endsWith(".html")) {
      const html = await readFile(target, "utf8");
      await writeFile(target, html.replaceAll("/elizaveta-tutor", ""));
    }
  }
}

await rewriteHtml(output);
await writeFile(
  path.join(output, ".htaccess"),
  `Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 /404.html

<IfModule mod_authz_core.c>
  <FilesMatch "^\\.">
    Require all denied
  </FilesMatch>
</IfModule>
<IfModule !mod_authz_core.c>
  <FilesMatch "^\\.">
    Order allow,deny
    Deny from all
  </FilesMatch>
</IfModule>
`,
);

console.log(`Timeweb export created in ${output}`);
