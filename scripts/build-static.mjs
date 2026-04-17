import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const outputDir = path.join(rootDir, "dist");

const staticFiles = [
  "index.html",
  "admin.html",
  "app.js",
  "styles.css",
  "favicon.jpg",
  "robots.txt",
  "sitemap.xml",
];

const staticDirs = ["affiliate", "coa", "contact", "faq", "img", "img-optimized"];

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

for (const file of staticFiles) {
  await cp(path.join(rootDir, file), path.join(outputDir, file));
}

for (const dir of staticDirs) {
  await cp(path.join(rootDir, dir), path.join(outputDir, dir), { recursive: true });
}
