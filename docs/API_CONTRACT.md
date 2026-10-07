# API Contract

## Endpoint

POST /analyze

## Input

Image file uploaded using multipart/form-data.

Field:
- image

## Processing Flow

Frontend
    ↓
POST /analyze
    ↓
Backend
    ↓
ML / Image Processing
    ↓
Prediction
    ↓
Backend
    ↓
Frontend

## Response

{
  "prediction": "TAMPERED",
  "confidence": 0.94,
  "ela_image": "..."
}
