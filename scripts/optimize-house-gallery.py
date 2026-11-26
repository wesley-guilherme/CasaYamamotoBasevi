# Gera fotografias WebP responsivas da casa, preservando proporções, orientação e cores.
"""Produz cópias leves para a galeria sem modificar as fotografias originais."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageCms, ImageOps


# Define resoluções para cada tela e um perfil comum para preservar as cores no navegador.
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
RESPONSIVE_WIDTHS = (480, 800, 1200, 1600)
SRGB_PROFILE = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB"))


# Ordena arquivos e pastas pelos números presentes nos nomes.
def natural_key(path: Path) -> list[str | int]:
    return [int(part) if part.isdigit() else part.lower() for part in re.split(r"(\d+)", path.name)]


# Transforma o nome do ambiente em um identificador utilizado nas pastas e URLs.
def slugify(value: str) -> str:
    return value.strip().lower().replace("_", "-").replace(" ", "-")


# Corrige a orientação e converte o perfil original para sRGB, sem descartar suas cores.
def prepare_image(source: Path) -> Image.Image:
    with Image.open(source) as image:
        original_profile = image.info.get("icc_profile")
        image = ImageOps.exif_transpose(image)
        alpha = image.getchannel("A") if "A" in image.getbands() else None
        color_image = image if image.mode in {"RGB", "CMYK", "LAB"} else image.convert("RGB")

        # Interpreta perfis de câmera, como ROMM, antes de gerar as cópias para a web.
        if original_profile:
            color_image = ImageCms.profileToProfile(
                color_image,
                ImageCms.ImageCmsProfile(BytesIO(original_profile)),
                SRGB_PROFILE,
                outputMode="RGB",
            )
        else:
            color_image = color_image.convert("RGB")

        # Compõe transparências sobre branco sem alterar a proporção ou cortar a fotografia.
        if alpha is not None:
            canvas = Image.new("RGB", image.size, "white")
            canvas.paste(color_image, mask=alpha)
            return canvas
        return color_image


# Grava uma cópia com perfil sRGB e nome por conteúdo para evitar imagens antigas no cache.
def save_variant(image: Image.Image, directory: Path, name: str, quality: int) -> dict[str, object]:
    buffer = BytesIO()
    image.save(buffer, "WEBP", quality=quality, method=6, icc_profile=SRGB_PROFILE.tobytes())
    content = buffer.getvalue()
    fingerprint = hashlib.sha256(content).hexdigest()[:10]
    filename = f"{name}-{fingerprint}.webp"
    (directory / filename).write_bytes(content)
    return {"src": f"/images/casa/{directory.name}/{filename}", "width": image.width, "height": image.height}


# Lê os argumentos e gera resoluções por largura, fotos ampliadas e o manifesto dos ambientes.
def main() -> None:
    # Lê os caminhos de origem, destino e manifesto informados na linha de comando.
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("manifest", type=Path)
    args = parser.parse_args()

    source_root = args.source.resolve()
    destination_root = args.destination.resolve()
    manifest_path = args.manifest.resolve()

    # Confere a origem antes de criar a estrutura de arquivos de destino.
    if not source_root.is_dir():
        raise SystemExit(f"Source folder does not exist: {source_root}")
    if destination_root == source_root or source_root in destination_root.parents:
        raise SystemExit("O destino deve ficar fora da pasta de fotografias originais.")

    destination_root.mkdir(parents=True, exist_ok=True)
    manifest_path.parent.mkdir(parents=True, exist_ok=True)

    # Percorre os ambientes e seleciona as fotografias com extensões aceitas.
    rooms: list[dict[str, object]] = []
    for room_folder in sorted((path for path in source_root.iterdir() if path.is_dir()), key=natural_key):
        sources = sorted(
            (path for path in room_folder.iterdir() if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS),
            key=natural_key,
        )
        if not sources:
            continue

        room_slug = slugify(room_folder.name)
        room_destination = destination_root / room_slug
        room_destination.mkdir(parents=True, exist_ok=True)
        images: list[dict[str, object]] = []

        # Produz versões sem recortes nem ampliação artificial; a maior só é necessária ao abrir a foto.
        for index, source in enumerate(sources, start=1):
            image = prepare_image(source)
            full_image = image.copy()
            full_image.thumbnail((3200, 3200), Image.Resampling.LANCZOS)
            full = save_variant(full_image, room_destination, f"{index:02d}-full", 87)
            variants: list[dict[str, object]] = []

            # Usa a largura real como referência, inclusive nas fotos verticais dos quartos.
            for width in RESPONSIVE_WIDTHS:
                if width >= full_image.width:
                    continue
                height = round(image.height * width / image.width)
                variant = image.resize((width, height), Image.Resampling.LANCZOS)
                variants.append(save_variant(variant, room_destination, f"{index:02d}-{width}w", 85))
            variants.append(full)
            thumb = variants[0]
            images.append(
                {
                    "thumb": thumb["src"],
                    "thumbWidth": thumb["width"],
                    "thumbHeight": thumb["height"],
                    "full": full["src"],
                    "width": full["width"],
                    "height": full["height"],
                    "sources": variants,
                }
            )
            print(f"{room_slug}/{index:02d}: {len(variants)} versões geradas", flush=True)

        rooms.append({"slug": room_slug, "sourceFolder": room_folder.name, "images": images})

    # Grava o catálogo que será consumido pela galeria da casa.
    manifest_path.write_text(json.dumps(rooms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
