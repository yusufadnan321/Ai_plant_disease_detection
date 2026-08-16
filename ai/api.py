"""FastAPI service connecting the trained classifier to the React frontend."""
from __future__ import annotations

import csv
import io
import json
import os
import re
from pathlib import Path

import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError

from .model import build_model

ROOT = Path(__file__).resolve().parent.parent
ARTIFACTS = ROOT / "ai" / "artifacts"
CLASS_FILE = ARTIFACTS / "class_names.json"
WEIGHTS_FILE = ARTIFACTS / "best_model.weights.h5"
DISEASE_FILE = ROOT / "ai" / "trainingdataset" / "plant_disease_dataset.csv"
# Vercel Functions accept at most 4.5 MB request bodies. Keeping the image at
# 4 MB leaves room for multipart headers and the optional crop field.
MAX_UPLOAD_BYTES = 4 * 1024 * 1024
MIN_CONFIDENCE = 65.0
MIN_TOP_TWO_MARGIN = 15.0
MIN_CROP_CONFIDENCE = 60.0
MIN_CROP_MARGIN = 15.0


def normalize(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", value.lower())


def split_items(value: str) -> list[str]:
    return [part.strip() for part in re.split(r";\s*", value or "") if part.strip()]


def readable_class(class_name: str) -> tuple[str, str]:
    crop, disease = class_name.split("___", 1)
    crop = crop.title()
    disease = disease.replace("_", " ").strip()
    return crop, disease


def load_disease_records() -> dict[tuple[str, str], dict[str, str]]:
    with DISEASE_FILE.open(encoding="utf-8-sig", newline="") as file:
        rows = list(csv.DictReader(file))
    return {(normalize(row["Crop"]), normalize(row["Disease"])): row for row in rows}


metadata = json.loads(CLASS_FILE.read_text(encoding="utf-8"))
CLASS_NAMES: list[str] = metadata["classes"]
IMAGE_SIZE = int(metadata["image_size"])
MODEL, _ = build_model(IMAGE_SIZE, len(CLASS_NAMES), backbone_weights=None)
MODEL.load_weights(WEIGHTS_FILE)
DISEASES = load_disease_records()

app = FastAPI(title="Plant Disease Detection API", version="1.0.0")
allowed_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
allowed_origins.extend(
    origin.strip().rstrip("/")
    for origin in os.getenv("FRONTEND_URL", "").split(",")
    if origin.strip()
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "model_loaded": True, "classes": len(CLASS_NAMES)}


@app.post("/api/predict")
async def predict(image: UploadFile = File(...), crop: str | None = Form(default=None)) -> dict:
    if image.content_type not in {"image/jpeg", "image/jpg", "image/png", "image/webp"}:
        raise HTTPException(status_code=415, detail="Upload a JPG, PNG, or WebP image.")
    contents = await image.read(MAX_UPLOAD_BYTES + 1)
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Image must be 10 MB or smaller.")
    try:
        leaf = Image.open(io.BytesIO(contents)).convert("RGB")
        leaf = leaf.resize((IMAGE_SIZE, IMAGE_SIZE), Image.Resampling.BILINEAR)
    except (UnidentifiedImageError, OSError) as error:
        raise HTTPException(status_code=400, detail="The uploaded file is not a valid image.") from error

    probabilities = MODEL.predict(np.asarray(leaf, dtype=np.float32)[None, ...], verbose=0)[0]
    crop_scores: dict[str, float] = {}
    for index, class_name in enumerate(CLASS_NAMES):
        class_crop = class_name.split("___", 1)[0].title()
        crop_scores[class_crop] = crop_scores.get(class_crop, 0.0) + float(probabilities[index])
    ranked_crops = sorted(crop_scores.items(), key=lambda item: item[1], reverse=True)
    detected_crop, detected_crop_score = ranked_crops[0]
    crop_margin = (detected_crop_score - ranked_crops[1][1]) * 100
    crop_confidence = detected_crop_score * 100
    selected_crop = (crop or "").strip().lower()
    crop_is_uncertain = crop_confidence < MIN_CROP_CONFIDENCE or crop_margin < MIN_CROP_MARGIN

    def crop_rejection(name: str, description: str, mismatch: bool) -> dict:
        return {
            "diseaseId": "crop_verification_failed",
            "className": "",
            "diseaseName": name,
            "crop": detected_crop if not crop_is_uncertain else "Unknown",
            "selectedCrop": crop or "Unknown",
            "detectedCrop": detected_crop,
            "cropMismatch": mismatch,
            "isHealthy": False,
            "isUncertain": True,
            "confidence": round(crop_confidence, 2),
            "confidenceMargin": round(crop_margin, 2),
            "description": description,
            "symptoms": [],
            "causes": [],
            "medicines": ["No medicine is recommended because the crop was not verified."],
            "prevention": ["Upload a clear close-up of one leaf and select the correct crop."],
            "source": "",
            "topPredictions": [],
            "cropPredictions": [
                {"crop": name, "confidence": round(score * 100, 2)}
                for name, score in ranked_crops
            ],
        }

    if crop_is_uncertain:
        return crop_rejection(
            "Unable to identify crop",
            "The model could not identify the crop reliably. Upload a clearer image with one leaf filling most of the frame.",
            False,
        )
    if selected_crop and selected_crop != "unknown" and selected_crop != detected_crop.lower():
        return crop_rejection(
            "Crop mismatch",
            f"The selected crop is {crop.title()}, but the image appears to be {detected_crop}. Select the correct crop or upload another image.",
            True,
        )

    verified_crop = detected_crop.lower()
    allowed = np.array(
        [name.split("___", 1)[0].lower() == verified_crop for name in CLASS_NAMES]
    )
    probabilities = np.where(allowed, probabilities, 0.0)
    probabilities = probabilities / float(probabilities.sum())
    top_indices = np.argsort(probabilities)[-3:][::-1]
    best_index = int(top_indices[0])
    class_name = CLASS_NAMES[best_index]
    crop, disease = readable_class(class_name)
    is_healthy = "healthy" in normalize(disease) or "normal" in normalize(disease)
    confidence = float(probabilities[best_index] * 100)
    second_confidence = float(probabilities[int(top_indices[1])] * 100)
    margin = confidence - second_confidence
    is_uncertain = confidence < MIN_CONFIDENCE or margin < MIN_TOP_TWO_MARGIN
    record = DISEASES.get((normalize(crop), normalize(disease)))

    if is_uncertain:
        disease_name = "Uncertain result"
        details = {
            "description": "The model could not distinguish the top classes reliably. Upload another clear, close-up image before applying treatment.",
            "symptoms": [],
            "causes": [],
            "medicines": ["No medicine is recommended for an uncertain prediction."],
            "prevention": ["Retake the photo in good natural light with one leaf filling most of the frame."],
            "source": "",
        }
    elif is_healthy:
        disease_name = f"Healthy {crop} Leaf"
        details = {
            "description": "The model did not detect one of the supported diseases in this leaf image.",
            "symptoms": ["No supported disease pattern was detected."],
            "causes": ["The leaf appears normal for the supported model classes."],
            "medicines": ["No disease medicine is indicated by this prediction."],
            "prevention": ["Continue routine crop monitoring and good field hygiene."],
            "source": "",
        }
    elif record:
        disease_name = record["Disease"]
        details = {
            "description": f"The image was classified as {record['Crop']} {record['Disease']}.",
            "symptoms": split_items(record.get("Symptoms", "")),
            "causes": split_items(record.get("Causes", "")),
            "medicines": split_items(record.get("Treatment", "")),
            "prevention": split_items(record.get("Prevention", "")),
            "source": record.get("Source", "").strip(),
        }
    else:
        disease_name = disease
        details = {"description": f"The image was classified as {crop} {disease}.", "symptoms": [], "causes": [], "medicines": [], "prevention": [], "source": ""}

    return {
        "diseaseId": class_name,
        "className": class_name,
        "diseaseName": disease_name,
        "crop": crop,
        "isHealthy": is_healthy,
        "isUncertain": is_uncertain,
        "confidence": round(confidence, 2),
        "confidenceMargin": round(margin, 2),
        "cropConfidence": round(crop_confidence, 2),
        "cropConfidenceMargin": round(crop_margin, 2),
        "cropMismatch": False,
        **details,
        "topPredictions": [
            {"className": CLASS_NAMES[int(index)], "confidence": round(float(probabilities[index] * 100), 2)}
            for index in top_indices
        ],
        "cropPredictions": [
            {"crop": name, "confidence": round(score * 100, 2)}
            for name, score in ranked_crops
        ],
    }
