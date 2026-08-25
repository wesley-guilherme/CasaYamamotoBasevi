"""Generate lightweight WebP variants and a manifest for the house gallery."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from PIL import Image, ImageOps


SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def natural_key(path: Path) -> list[str | int]:
    return [int(part) if part.isdigit() else part.lower() for part in re.split(r"(\d+)", path.name)]


def slugify(value: str) -> str:
    return value.strip().lower().replace("_", "-").replace(" ", "-")


def prepare_image(source: Path) -> Image.Image:
    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image)
        if image.mode in {"RGBA", "LA"}:
            canvas = Image.new("RGB", image.size, "white")
            alpha = image.getchannel("A")
            canvas.paste(image.convert("RGB"), mask=alpha)
            return canvas
        return image.convert("RGB")


def save_variant(image: Image.Image, destination: Path, max_size: int, quality: int) -> tuple[int, int]:
    variant = image.copy()
    variant.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
    variant.save(destination, "WEBP", quality=quality, method=6, optimize=True)
    return variant.size


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("manifest", type=Path)
    args = parser.parse_args()

    source_root = args.source.resolve()
    destination_root = args.destination.resolve()
    manifest_path = args.manifest.resolve()

    if not source_root.is_dir():
        raise SystemExit(f"Source folder does not exist: {source_root}")

    destination_root.mkdir(parents=True, exist_ok=True)
    manifest_path.parent.mkdir(parents=True, exist_ok=True)

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

        for index, source in enumerate(sources, start=1):
            image = prepare_image(source)
            thumb_name = f"{index:02d}-thumb.webp"
            full_name = f"{index:02d}-full.webp"
            thumb_size = save_variant(image, room_destination / thumb_name, 900, 78)
            full_size = save_variant(image, room_destination / full_name, 2200, 84)
            images.append(
                {
                    "thumb": f"/images/casa/{room_slug}/{thumb_name}",
                    "thumbWidth": thumb_size[0],
                    "thumbHeight": thumb_size[1],
                    "full": f"/images/casa/{room_slug}/{full_name}",
                    "width": full_size[0],
                    "height": full_size[1],
                }
            )

        rooms.append({"slug": room_slug, "sourceFolder": room_folder.name, "images": images})

    manifest_path.write_text(json.dumps(rooms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
