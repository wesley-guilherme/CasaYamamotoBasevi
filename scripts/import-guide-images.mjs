// Importação das fotografias do guia com redimensionamento e conversão para WebP.
import { readdir, mkdir } from "node:fs/promises";
import { basename, extname, join, relative, resolve } from "node:path";
import sharp from "sharp";

// Pasta de origem das fotografias informada pela linha de comando.
const sourceRoot = resolve(process.argv[2] ?? "");
// Pasta pública de destino das imagens otimizadas do guia.
const targetRoot = resolve("public/images/guia");
// Extensões de imagem aceitas pelo importador.
const supported = new Set([".jpg", ".jpeg", ".png", ".dng"]);

// Percorre as subpastas e reúne os arquivos de imagem com extensões aceitas.
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

// Exige o caminho de origem antes de iniciar a importação das fotografias.
if (!process.argv[2]) throw new Error("Informe a pasta de origem das fotos.");

// Arquivos de imagem encontrados para conversão e publicação na pasta de destino.
const files = await walk(sourceRoot);
// Mantém o agrupamento por pasta e converte cada foto para WebP sem ampliar sua resolução.
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
