"""Run inference on one leaf image using the trained model."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import tensorflow as tf

try:
    from .model import build_model
except ImportError:
    from model import build_model


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("image", type=Path, help="Path to a leaf image")
    parser.add_argument("--model", type=Path, default=Path("ai/artifacts/best_model.weights.h5"))
    parser.add_argument("--classes", type=Path, default=Path("ai/artifacts/class_names.json"))
    parser.add_argument("--top-k", type=int, default=3)
    args = parser.parse_args()

    metadata = json.loads(args.classes.read_text(encoding="utf-8"))
    class_names = metadata["classes"]
    image_size = int(metadata["image_size"])
    model, _ = build_model(image_size, len(class_names), backbone_weights=None)
    model.load_weights(args.model)
    image = tf.keras.utils.load_img(args.image, target_size=(image_size, image_size))
    image_array = tf.keras.utils.img_to_array(image)[None, ...]
    probabilities = model.predict(image_array, verbose=0)[0]
    top_k = min(max(args.top_k, 1), len(class_names))
    indices = np.argsort(probabilities)[-top_k:][::-1]
    result = {
        "prediction": class_names[int(indices[0])],
        "confidence": float(probabilities[indices[0]]),
        "top_predictions": [
            {"class_name": class_names[int(i)], "confidence": float(probabilities[i])}
            for i in indices
        ],
    }
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
