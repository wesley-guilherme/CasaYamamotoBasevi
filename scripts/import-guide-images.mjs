import { readdir, mkdir } from "node:fs/promises";
import { basename, extname, join, relative, resolve } from "node:path";
import sharp from "sharp";

const sourceRoot = resolve(process.argv[2] ?? "");
const targetRoot = resolve("public/images/guia");
const supported = new Set([".jpg", ".jpeg", ".png", ".dng"]);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (supported.has(extname(entry.name).toLowerCase())) files.push(path);
  }
  return files;
}

if (!process.argv[2]) throw new Error("Informe a pasta de origem das fotos.");

const files = await walk(sourceRoot);
for (const source of files) {
  const relativePath = relative(sourceRoot, source);
  const folder = relativePath.split(/[\\/]/)[0].toLowerCase();
  const name = basename(source, extname(source)).toLowerCase();
  const destinationFolder = join(targetRoot, folder);
  const destination = join(destinationFolder, `${name}.webp`);
  await mkdir(destinationFolder, { recursive: true });
  await sharp(source)
    .rotate()
    .resize({ width: 1800, height: 1350, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 84, effort: 5 })
    .toFile(destination);
  console.log(destination);
}
