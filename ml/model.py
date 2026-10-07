from io import BytesIO

import numpy as np
import pandas as pd
from PIL import Image, ImageChops, ImageEnhance
from sklearn.ensemble import RandomForestClassifier


def create_ela(image_path, quality=90):
    image = Image.open(image_path).convert("RGB")

    buffer = BytesIO()
    image.save(buffer, format="JPEG", quality=quality)
    buffer.seek(0)

    recompressed = Image.open(buffer).convert("RGB")

    difference = ImageChops.difference(image, recompressed)
    ela_image = ImageEnhance.Brightness(difference).enhance(10)

    return ela_image


def ela_features(image_path):
    ela = create_ela(image_path)

    gray = np.array(ela).astype(np.float32).mean(axis=2)

    h, w = gray.shape

    regions = [
        gray[:h // 2, :w // 2],
        gray[:h // 2, w // 2:],
        gray[h // 2:, :w // 2],
        gray[h // 2:, w // 2:]
    ]

    features = []

    for region in regions:
        features.extend([
            region.mean(),
            region.std(),
            region.max()
        ])

    return features
def train_model(dataset_path):
    import os

    au_path = os.path.join(dataset_path, "Au_jpg")
    tp_path = os.path.join(dataset_path, "Tp_jpg")

    data = []

    # REAL images
    for filename in os.listdir(au_path):
        file_path = os.path.join(au_path, filename)

        try:
            features = ela_features(file_path)
            data.append(features + [0])
        except Exception:
            pass

    # TAMPERED images
    for filename in os.listdir(tp_path):
        file_path = os.path.join(tp_path, filename)

        try:
            features = ela_features(file_path)
            data.append(features + [1])
        except Exception:
            pass

    columns = [
        "TL_mean", "TL_std", "TL_max",
        "TR_mean", "TR_std", "TR_max",
        "BL_mean", "BL_std", "BL_max",
        "BR_mean", "BR_std", "BR_max",
        "label"
    ]

    df = pd.DataFrame(data, columns=columns)

    X = df.drop("label", axis=1)
    y = df["label"]

    model = RandomForestClassifier(
        n_estimators=100,
        random_state=42
    )

    model.fit(X, y)

    return model
def predict_image(model, image_path):
    features = ela_features(image_path)

    columns = [
        "TL_mean", "TL_std", "TL_max",
        "TR_mean", "TR_std", "TR_max",
        "BL_mean", "BL_std", "BL_max",
        "BR_mean", "BR_std", "BR_max"
    ]

    features_df = pd.DataFrame([features], columns=columns)

    prediction = model.predict(features_df)[0]

    probabilities = model.predict_proba(features_df)[0]
    confidence = probabilities[prediction] * 100

    result = "REAL" if prediction == 0 else "TAMPERED"

    return result, round(float(confidence), 2)
if __name__ == "__main__":
    print("ML module loaded successfully")