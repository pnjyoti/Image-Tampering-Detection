from pathlib import Path
from uuid import uuid4
from io import BytesIO

from fastapi import FastAPI, UploadFile, File, HTTPException
from PIL import Image

from forensic_engine.ela import generate_ela


app = FastAPI(title="Image Forensics & Tamper Reconstruction System")

UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("outputs")

UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)


@app.get("/")
def root():
    return {"message": "Backend is running"}


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        image_data = await file.read()

        image = Image.open(BytesIO(image_data))
        image.verify()

    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    extension = Path(file.filename or "").suffix.lower()

    if extension not in [".jpg", ".jpeg", ".png", ".webp"]:
        extension = ".jpg"

    stored_filename = f"{uuid4().hex}{extension}"
    stored_path = UPLOAD_DIR / stored_filename

    stored_path.write_bytes(image_data)

    output_filename = f"{Path(stored_filename).stem}_ela.png"
    output_path = OUTPUT_DIR / output_filename

    generate_ela(image_data, output_path)

    return {
        "message": "Image analyzed successfully",
        "filename": file.filename,
        "stored_filename": stored_filename,
        "ela_map": str(output_path)
    }