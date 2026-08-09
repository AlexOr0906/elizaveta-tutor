import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

const root = path.resolve("docs");
const port = Number(process.env.PAGES_PREVIEW_PORT ?? 4174);
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

createServer(async (request, response) => {
  let pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  pathname = pathname.replace(/^\/elizaveta-tutor/, "").replace(/^\/+/, "");
  if (!pathname || pathname.endsWith("/")) pathname += "index.html";
  const file = path.join(root, pathname);

  try {
    const info = await stat(file);
    if (!info.isFile() || !file.startsWith(root)) throw new Error("Not found");
    response.setHeader("Content-Type", contentTypes[path.extname(file)] ?? "application/octet-stream");
    createReadStream(file).pipe(response);
  } catch {
    response.statusCode = 404;
    response.end("Not found");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Static GitHub Pages preview: http://127.0.0.1:${port}/elizaveta-tutor/`);
});
