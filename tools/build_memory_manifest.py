#!/usr/bin/env python3
"""Write the static photo list used by the birthday memory scenes."""

import json
from pathlib import Path
from urllib.parse import quote


ROOT = Path(__file__).resolve().parents[1]
PHOTO_DIR = ROOT / "pic"
MANIFEST = ROOT / "assets" / "photos" / "memories.json"
IMAGE_SUFFIXES = {".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"}


def build_manifest() -> list[dict[str, str]]:
    photos = []
    if PHOTO_DIR.is_dir():
        for image in sorted(PHOTO_DIR.iterdir(), key=lambda path: path.name.casefold()):
            if image.is_file() and image.suffix.casefold() in IMAGE_SUFFIXES:
                photos.append({
                    "name": image.name,
                    "src": quote(f"pic/{image.name}", safe="/"),
                })

    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(photos, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return photos


if __name__ == "__main__":
    print(f"Indexed {len(build_manifest())} images from pic/")
