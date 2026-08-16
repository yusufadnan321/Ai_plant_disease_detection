"""MobileNetV2 architecture shared by training and production inference."""

from __future__ import annotations

import tensorflow as tf


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
        input_shape=(image_size, image_size, 3),
        include_top=False,
        weights=backbone_weights,
    )
    base.trainable = False

    inputs = tf.keras.Input((image_size, image_size, 3), name="image")
    x = augmentation(inputs)
    x = tf.keras.layers.Rescaling(
        1.0 / 127.5, offset=-1, name="mobilenet_preprocessing"
    )(x)
    x = base(x, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(0.2)(x)
    outputs = tf.keras.layers.Dense(
        class_count, activation="softmax", name="class_probabilities"
    )(x)
    return tf.keras.Model(inputs, outputs), base
