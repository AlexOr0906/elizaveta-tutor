import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, "docs");
const sourceOrigin = process.env.PAGES_SOURCE_ORIGIN ?? "http://127.0.0.1:3000";
const basePath = (process.env.PAGES_BASE_PATH ?? "/elizaveta-tutor").replace(/\/$/, "");

const routes = [
  { pathname: "/", file: "index.html" },
  { pathname: "/prices", file: "prices/index.html" },
  { pathname: "/booking", file: "booking/index.html" },
];

let futureFeatures;
try {
  futureFeatures = await readFile(path.join(output, "future-features.md"));
} catch {
  futureFeatures = null;
}

async function download(pathname) {
  const response = await fetch(`${sourceOrigin}${pathname}`);
  if (!response.ok) throw new Error(`Cannot export ${pathname}: ${response.status}`);
  return response.text();
}

function makeStatic(html) {
  let result = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<link\b[^>]*rel=["']modulepreload["'][^>]*\/?\s*>/gi, "")
    .replace(/<link\b[^>]*rel=["']stylesheet["'][^>]*\/?\s*>/gi, "")
    .replace(/<!--\s*-->/g, "")
    .replace(/href="\/prices"/g, `href="${basePath}/prices/"`)
    .replace(/href="\/booking"/g, `href="${basePath}/booking/"`)
    .replace(/href="\/"/g, `href="${basePath}/"`)
    .replace(/href="\/favicon\.svg"/g, `href="${basePath}/favicon.svg"`)
    .replace(/src="\/images\//g, `src="${basePath}/images/`);

  result = result.replace(
    "</head>",
    `<link rel="stylesheet" href="${basePath}/assets/site.css"/><link rel="icon" href="${basePath}/favicon.svg"/></head>`,
  );
  result = result.replace(
    "</body>",
    `<script src="${basePath}/assets/pages-runtime.js" defer></script></body>`,
  );
  return result;
}

await rm(output, { recursive: true, force: true });
await mkdir(path.join(output, "assets"), { recursive: true });
await mkdir(path.join(output, "images"), { recursive: true });
if (futureFeatures) await writeFile(path.join(output, "future-features.md"), futureFeatures);

await writeFile(path.join(output, "assets", "site.css"), await download("/app/globals.css"));
await cp(
  path.join(root, "scripts", "github-pages-runtime.js"),
  path.join(output, "assets", "pages-runtime.js"),
);
await cp(path.join(root, "public", "favicon.svg"), path.join(output, "favicon.svg"));
await cp(
  path.join(root, "public", "images", "elizaveta-vyacheslavovna.png"),
  path.join(output, "images", "elizaveta-vyacheslavovna.png"),
);

for (const route of routes) {
  const target = path.join(output, route.file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, makeStatic(await download(route.pathname)));
}

await writeFile(path.join(output, ".nojekyll"), "");
await writeFile(path.join(output, "404.html"), await readFile(path.join(output, "index.html")));

console.log(`GitHub Pages export created in ${output}`);
