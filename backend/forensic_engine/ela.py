from pathlib import Path
from io import BytesIO

from PIL import Image, ImageChops, ImageEnhance


def generate_ela(image_data: bytes, output_path: Path) -> None:
    original = Image.open(BytesIO(image_data)).convert("RGB")

    temp_path = output_path.with_name("ela_temp.jpg")
    original.save(temp_path, "JPEG", quality=90)

    recompressed = Image.open(temp_path)

    difference = ImageChops.difference(original, recompressed)

    extrema = difference.getextrema()
    max_difference = max(
        channel_max
        for _, channel_max in extrema
    )

    if max_difference == 0:
        max_difference = 1

    scale = 255 / max_difference

    ela_image = ImageEnhance.Brightness(difference).enhance(scale)

    ela_image.save(output_path)

    temp_path.unlink()