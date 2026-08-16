"""Train and evaluate one MobileNetV2 model on all crop disease classes.

The dataset is only read. Splits are stored as CSV files; images are never moved,
copied, renamed, or deleted.
"""

from __future__ import annotations

import argparse
import csv
import json
import random
from collections import Counter
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".gif", ".webp"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dataset", type=Path, default=Path("trainingdataset"))
    parser.add_argument("--output", type=Path, default=Path("ai/artifacts"))
    parser.add_argument("--image-size", type=int, default=224)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--head-epochs", type=int, default=10)
    parser.add_argument("--fine-tune-epochs", type=int, default=5)
    parser.add_argument("--learning-rate", type=float, default=1e-3)
    parser.add_argument("--seed", type=int, default=42)
    return parser.parse_args()


def discover_images(dataset_dir: Path) -> tuple[list[str], list[str]]:
    """Discover dataset/<crop>/<class>/<image> and make globally unique labels."""
    paths: list[str] = []
    labels: list[str] = []
    if not dataset_dir.is_dir():
        raise FileNotFoundError(f"Dataset directory does not exist: {dataset_dir.resolve()}")

    for crop_dir in sorted((p for p in dataset_dir.iterdir() if p.is_dir()), key=lambda p: p.name.lower()):
        for class_dir in sorted((p for p in crop_dir.iterdir() if p.is_dir()), key=lambda p: p.name.lower()):
            # PlantVillage folders already include the crop (Apple___healthy).
            # Rice folders do not, so prefix them to avoid ambiguous class names.
            class_name = class_dir.name
            if not class_name.lower().startswith(crop_dir.name.lower() + "___"):
                class_name = f"{crop_dir.name}___{class_name}"
            for image_path in sorted(class_dir.rglob("*")):
                if image_path.is_file() and image_path.suffix.lower() in IMAGE_EXTENSIONS:
                    paths.append(str(image_path.resolve()))
                    labels.append(class_name)

    if not paths:
        raise ValueError(f"No supported images found under {dataset_dir.resolve()}")
    return paths, labels


def split_data(paths: list[str], labels: list[str], seed: int):
    """Create a reproducible stratified 70/15/15 train/validation/test split."""
    counts = Counter(labels)
    too_small = {name: count for name, count in counts.items() if count < 7}
    if too_small:
        raise ValueError(f"Each class needs at least 7 images for a 70/15/15 split: {too_small}")

    train_paths, temp_paths, train_labels, temp_labels = train_test_split(
        paths, labels, test_size=0.30, random_state=seed, stratify=labels
    )
    val_paths, test_paths, val_labels, test_labels = train_test_split(
        temp_paths, temp_labels, test_size=0.50, random_state=seed, stratify=temp_labels
    )
    return (train_paths, train_labels), (val_paths, val_labels), (test_paths, test_labels)


def save_split_csv(output: Path, name: str, paths: list[str], labels: list[str]) -> None:
    with (output / f"{name}_split.csv").open("w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(["path", "class_name"])
        writer.writerows(zip(paths, labels))


def make_dataset(
    paths: list[str], labels: list[str], class_to_index: dict[str, int], image_size: int,
    batch_size: int, training: bool, seed: int
) -> tf.data.Dataset:
    label_ids = [class_to_index[label] for label in labels]
    dataset = tf.data.Dataset.from_tensor_slices((paths, label_ids))
    if training:
        dataset = dataset.shuffle(len(paths), seed=seed, reshuffle_each_iteration=True)

    def load_image(path, label):
        raw = tf.io.read_file(path)
        image = tf.io.decode_image(raw, channels=3, expand_animations=False)
        image.set_shape([None, None, 3])
        image = tf.image.resize(image, [image_size, image_size])
        return image, label

    return (
        dataset.map(load_image, num_parallel_calls=tf.data.AUTOTUNE)
        .batch(batch_size)
        .prefetch(tf.data.AUTOTUNE)
    )


def build_model(image_size: int, class_count: int, backbone_weights="imagenet"):
    augmentation = tf.keras.Sequential(
        [
            tf.keras.layers.RandomFlip("horizontal"),
            tf.keras.layers.RandomRotation(0.10),
            tf.keras.layers.RandomZoom(0.10),
            tf.keras.layers.RandomContrast(0.10),
        ],
        name="augmentation",
    )
    base = tf.keras.applications.MobileNetV2(
        input_shape=(image_size, image_size, 3), include_top=False, weights=backbone_weights
    )
    base.trainable = False

    inputs = tf.keras.Input((image_size, image_size, 3), name="image")
    x = augmentation(inputs)
    x = tf.keras.layers.Rescaling(1.0 / 127.5, offset=-1, name="mobilenet_preprocessing")(x)
    x = base(x, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(0.2)(x)
    outputs = tf.keras.layers.Dense(class_count, activation="softmax", name="class_probabilities")(x)
    return tf.keras.Model(inputs, outputs), base


def compile_model(model: tf.keras.Model, learning_rate: float) -> None:
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )


class TrainingStatus(tf.keras.callbacks.Callback):
    """Write a small heartbeat file so stalled runs are easy to identify."""

    def __init__(self, output: Path, phase: str):
        super().__init__()
        self.output = output
        self.phase = phase

    def write(self, state: str, **details) -> None:
        from datetime import datetime, timezone

        payload = {
            "state": state,
            "phase": self.phase,
            "updated_at": datetime.now(timezone.utc).isoformat(),
            **details,
        }
        (self.output / "training_status.json").write_text(
            json.dumps(payload, indent=2), encoding="utf-8"
        )

    def on_train_begin(self, logs=None):
        self.write("running")

    def on_train_batch_end(self, batch, logs=None):
        if batch % 25 == 0:
            self.write(
                "running", batch=int(batch + 1),
                accuracy=float((logs or {}).get("accuracy", 0)),
                loss=float((logs or {}).get("loss", 0)),
            )

    def on_epoch_end(self, epoch, logs=None):
        self.write(
            "epoch_complete", epoch=int(epoch + 1),
            metrics={key: float(value) for key, value in (logs or {}).items()},
        )


def save_history(histories: list[dict], output: Path) -> None:
    combined: dict[str, list[float]] = {}
    for history in histories:
        for key, values in history.items():
            combined.setdefault(key, []).extend(float(value) for value in values)
    (output / "training_history.json").write_text(json.dumps(combined, indent=2), encoding="utf-8")

    epochs = range(1, len(combined["loss"]) + 1)
    fig, axes = plt.subplots(1, 2, figsize=(12, 4))
    axes[0].plot(epochs, combined["accuracy"], label="train")
    axes[0].plot(epochs, combined["val_accuracy"], label="validation")
    axes[0].set(title="Model accuracy", xlabel="Epoch", ylabel="Accuracy")
    axes[0].legend()
    axes[1].plot(epochs, combined["loss"], label="train")
    axes[1].plot(epochs, combined["val_loss"], label="validation")
    axes[1].set(title="Model loss", xlabel="Epoch", ylabel="Loss")
    axes[1].legend()
    fig.tight_layout()
    fig.savefig(output / "accuracy_loss.png", dpi=160)
    plt.close(fig)


def main() -> None:
    args = parse_args()
    random.seed(args.seed)
    np.random.seed(args.seed)
    tf.random.set_seed(args.seed)
    args.output.mkdir(parents=True, exist_ok=True)

    paths, labels = discover_images(args.dataset)
    class_names = sorted(set(labels), key=str.lower)
    class_to_index = {name: index for index, name in enumerate(class_names)}
    splits = split_data(paths, labels, args.seed)
    split_names = ("train", "validation", "test")
    for split_name, (split_paths, split_labels) in zip(split_names, splits):
        save_split_csv(args.output, split_name, split_paths, split_labels)

    mapping = {
        "image_size": args.image_size,
        "classes": class_names,
        "class_to_index": class_to_index,
    }
    (args.output / "class_names.json").write_text(json.dumps(mapping, indent=2), encoding="utf-8")
    summary = {
        "total_images": len(paths),
        "number_of_classes": len(class_names),
        "images_per_class": dict(sorted(Counter(labels).items())),
        "split_sizes": {name: len(split[0]) for name, split in zip(split_names, splits)},
        "seed": args.seed,
    }
    (args.output / "dataset_summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(json.dumps(summary, indent=2))

    train_ds = make_dataset(*splits[0], class_to_index, args.image_size, args.batch_size, True, args.seed)
    val_ds = make_dataset(*splits[1], class_to_index, args.image_size, args.batch_size, False, args.seed)
    test_ds = make_dataset(*splits[2], class_to_index, args.image_size, args.batch_size, False, args.seed)

    train_ids = [class_to_index[label] for label in splits[0][1]]
    counts = Counter(train_ids)
    class_weight = {i: len(train_ids) / (len(class_names) * counts[i]) for i in range(len(class_names))}

    model, base = build_model(args.image_size, len(class_names))
    # Saving a complete .keras archive froze on this Windows setup. Checkpoint only
    # weights during training; this is smaller, reliable, and fully resumable.
    checkpoint = args.output / "best_model.weights.h5"
    checkpoint_callback = tf.keras.callbacks.ModelCheckpoint(
        checkpoint, monitor="val_accuracy", save_best_only=True, save_weights_only=True
    )
    common_callbacks = [
        checkpoint_callback,
        tf.keras.callbacks.EarlyStopping(monitor="val_loss", patience=3, restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(monitor="val_loss", patience=2, factor=0.2),
    ]
    compile_model(model, args.learning_rate)
    histories = []
    if args.head_epochs > 0:
        result = model.fit(
            train_ds, validation_data=val_ds, epochs=args.head_epochs,
            class_weight=class_weight,
            callbacks=[TrainingStatus(args.output, "frozen_head"), *common_callbacks],
            verbose=2,
        )
        histories.append(result.history)

    if args.fine_tune_epochs > 0:
        base.trainable = True
        # Fine-tune only the last 30 layers; BatchNorm remains frozen for stability.
        for layer in base.layers[:-30]:
            layer.trainable = False
        for layer in base.layers[-30:]:
            if isinstance(layer, tf.keras.layers.BatchNormalization):
                layer.trainable = False
        compile_model(model, args.learning_rate / 100)
        result = model.fit(
            train_ds, validation_data=val_ds, epochs=args.fine_tune_epochs,
            class_weight=class_weight,
            callbacks=[TrainingStatus(args.output, "fine_tuning"), *common_callbacks],
            verbose=2,
        )
        histories.append(result.history)

    if not histories:
        raise ValueError("At least one of --head-epochs or --fine-tune-epochs must be greater than zero")
    save_history(histories, args.output)

    model.load_weights(checkpoint)
    test_loss, test_accuracy = model.evaluate(test_ds, verbose=1)
    probabilities = model.predict(test_ds, verbose=1)
    predictions = probabilities.argmax(axis=1)
    true_ids = np.array([class_to_index[label] for label in splits[2][1]])
    report = classification_report(
        true_ids, predictions, target_names=class_names, output_dict=True, zero_division=0
    )
    metrics = {"test_loss": float(test_loss), "test_accuracy": float(test_accuracy), "report": report}
    (args.output / "test_metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")

    matrix = confusion_matrix(true_ids, predictions, labels=range(len(class_names)))
    np.savetxt(args.output / "confusion_matrix.csv", matrix, delimiter=",", fmt="%d")
    fig, axis = plt.subplots(figsize=(14, 12))
    image = axis.imshow(matrix, interpolation="nearest", cmap="Blues")
    fig.colorbar(image, ax=axis)
    axis.set(
        title="Test-set confusion matrix", xlabel="Predicted class", ylabel="True class",
        xticks=range(len(class_names)), yticks=range(len(class_names)),
        xticklabels=class_names, yticklabels=class_names,
    )
    plt.setp(axis.get_xticklabels(), rotation=60, ha="right", fontsize=7)
    plt.setp(axis.get_yticklabels(), fontsize=7)
    fig.tight_layout()
    fig.savefig(args.output / "confusion_matrix.png", dpi=180)
    plt.close(fig)
    TrainingStatus(args.output, "complete").write(
        "complete", test_accuracy=float(test_accuracy), test_loss=float(test_loss)
    )
    print(f"Test accuracy: {test_accuracy:.4f}")
    print(f"Saved all outputs to: {args.output.resolve()}")


if __name__ == "__main__":
    main()
