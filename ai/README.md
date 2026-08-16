# Plant disease classifier (MobileNetV2)

This folder trains **one 18-class model** across Apple, Potato, Rice, and Tomato.
It discovers folders shaped like `trainingdataset/<crop>/<disease>/<image>` automatically.
The original dataset is read-only: no image is copied, moved, renamed, edited, or deleted.

## 1. Create and activate an environment (PowerShell)

From the project root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r ai\requirements.txt
```

Python 3.10 or 3.11 is usually the easiest choice if TensorFlow installation fails on
your machine. Training is much faster with a supported NVIDIA GPU, but CPU also works.

## 2. Train and evaluate

```powershell
python ai\train.py --dataset trainingdataset --output ai\artifacts
```

Defaults: 224x224 RGB images, batch size 32, a reproducible stratified 70/15/15 split,
10 epochs with the ImageNet MobileNetV2 backbone frozen, then 5 low-learning-rate
fine-tuning epochs. Training-only augmentation uses flips, rotations, zoom, and contrast.
Class weights reduce the effect of the uneven class sizes.

For a quick pipeline check before a full run:

```powershell
python ai\train.py --dataset trainingdataset --output ai\test_run --head-epochs 1 --fine-tune-epochs 0
```

Useful options:

```powershell
python ai\train.py --help
python ai\train.py --batch-size 16 --head-epochs 15 --fine-tune-epochs 5
```

Use a smaller batch (for example 8 or 16) if memory runs out. The first run downloads
MobileNetV2 ImageNet weights. Early stopping may finish before every requested epoch.

## 3. Outputs

`ai/artifacts/` will contain:

- `best_model.weights.h5`: best validation-accuracy model weights
- `training_status.json`: current phase, heartbeat, and latest metrics
- `class_names.json`: class/index mapping and required input size
- `dataset_summary.json`: discovered classes, counts, and split sizes
- `train_split.csv`, `validation_split.csv`, `test_split.csv`: reproducible file lists
- `training_history.json` and `accuracy_loss.png`: learning curves
- `test_metrics.json`: test accuracy, loss, precision, recall, and F1 per class
- `confusion_matrix.csv` and `confusion_matrix.png`: numeric and plotted results

## 4. Predict one image

```powershell
python ai\predict.py "C:\path\to\leaf.jpg"
```

The command prints JSON containing the predicted class, confidence, and top three
predictions. The classifier predicts only a class. Symptoms, causes, treatment, and
prevention should be looked up from your existing disease information using that class
name; those facts cannot be learned reliably from leaf pixels alone.

## Method summary

1. Discover all crop/class folders and supported image files.
2. Assign globally unique labels (for example `Rice___Blast`).
3. Stratify files into train (70%), validation (15%), and test (15%) lists.
4. Resize to 224x224 and augment only training batches.
5. train a new classification head on ImageNet MobileNetV2 features.
6. Fine-tune the final 30 backbone layers at a much smaller learning rate.
7. Select the best model using validation accuracy and evaluate it once on the test set.
