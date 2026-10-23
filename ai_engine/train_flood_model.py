
"""
Floodora: Urban Flood-Inundation ML Training Pipeline

This model classifies research-derived flood labels from satellite,
rainfall, and terrain features. It is not a live drain-sensor model
or a validated real-time flood forecasting system.
"""

import json
from datetime import datetime, timezone
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import ExtraTreesClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "raw" / "extracted" / "Flood_DSS_ML_Data" / "data"
OUTPUT = ROOT / "ai_engine" / "models"
RANDOM_STATE = 42


def evaluate(model, X, y):
    predictions = model.predict(X)
    probabilities = model.predict_proba(X)[:, 1]

    return {
        "accuracy": round(float(accuracy_score(y, predictions)), 4),
        "precision": round(float(precision_score(y, predictions, zero_division=0)), 4),
        "recall": round(float(recall_score(y, predictions, zero_division=0)), 4),
        "f1": round(float(f1_score(y, predictions, zero_division=0)), 4),
        "roc_auc": round(float(roc_auc_score(y, probabilities)), 4),
        "confusion_matrix": confusion_matrix(
            y, predictions, labels=[0, 1]
        ).tolist(),
        "classification_report": classification_report(
            y,
            predictions,
            labels=[0, 1],
            target_names=["non_flood", "flood"],
            output_dict=True,
            zero_division=0,
        ),
    }


def main():
    # Load the supplied train/test split.
    X_train = pd.read_csv(DATA / "features_train.csv")
    y_train = pd.read_csv(DATA / "flood_labels_train.csv")[
        "flood_label"
    ].astype(int)

    X_test = pd.read_csv(DATA / "features_test.csv")
    y_test = pd.read_csv(DATA / "flood_labels_test.csv")[
        "flood_label"
    ].astype(int)

    # Basic data checks.
    if len(X_train) != len(y_train) or len(X_test) != len(y_test):
        raise ValueError("Feature and label row counts do not match.")

    if list(X_train.columns) != list(X_test.columns):
        raise ValueError("Training and test feature columns differ.")

    if X_train.isnull().any().any() or X_test.isnull().any().any():
        raise ValueError("Missing feature values found.")

    if set(y_train.unique()) - {0, 1} or set(y_test.unique()) - {0, 1}:
        raise ValueError("Expected binary labels 0 and 1.")

    print("=== DATASET ===")
    print(f"Training rows: {len(X_train)}")
    print(f"Test rows: {len(X_test)}")
    print(f"Feature count: {X_train.shape[1]}")
    print("Training label counts:")
    print(y_train.value_counts().sort_index().to_dict())
    print("Test label counts:")
    print(y_test.value_counts().sort_index().to_dict())

    # Model selection uses only a validation split from training data.
    X_fit, X_val, y_fit, y_val = train_test_split(
        X_train,
        y_train,
        test_size=0.20,
        random_state=RANDOM_STATE,
        stratify=y_train,
    )

    candidates = {
        "LogisticRegression": Pipeline([
            ("scaler", StandardScaler()),
            ("model", LogisticRegression(
                max_iter=2000, random_state=RANDOM_STATE
            )),
        ]),
        "RandomForest": RandomForestClassifier(
            n_estimators=300,
            min_samples_leaf=2,
            class_weight="balanced",
            random_state=RANDOM_STATE,
            n_jobs=-1,
        ),
        "ExtraTrees": ExtraTreesClassifier(
            n_estimators=300,
            min_samples_leaf=2,
            class_weight="balanced",
            random_state=RANDOM_STATE,
            n_jobs=-1,
        ),
    }

    validation_results = {}

    print("\n=== VALIDATION RESULTS ===")
    for name, model in candidates.items():
        model.fit(X_fit, y_fit)
        metrics = evaluate(model, X_val, y_val)
        validation_results[name] = metrics

        print(
            f"{name}: "
            f"F1={metrics['f1']:.4f}, "
            f"ROC-AUC={metrics['roc_auc']:.4f}, "
            f"Precision={metrics['precision']:.4f}, "
            f"Recall={metrics['recall']:.4f}, "
            f"Accuracy={metrics['accuracy']:.4f}"
        )

    # Select by validation F1; use ROC-AUC to break ties.
    best_name = max(
        validation_results,
        key=lambda name: (
            validation_results[name]["f1"],
            validation_results[name]["roc_auc"],
        ),
    )

    print(f"\nSelected model: {best_name}")

    # Refit the chosen model on all training rows.
    best_model = candidates[best_name]
    best_model.fit(X_train, y_train)

    # Final evaluation on the untouched test set.
    test_metrics = evaluate(best_model, X_test, y_test)

    OUTPUT.mkdir(parents=True, exist_ok=True)
    model_path = OUTPUT / "flood_inundation_model.joblib"
    metrics_path = OUTPUT / "model_metrics.json"

    joblib.dump(
        {
            "model": best_model,
            "model_name": best_name,
            "feature_names": list(X_train.columns),
            "target_name": "flood_label",
            "target_meaning": "0=non-flood, 1=flood in the research dataset",
            "data_scope": (
                "Satellite, rainfall, and terrain-derived research samples; "
                "not live drainage sensor data"
            ),
            "trained_at_utc": datetime.now(timezone.utc).isoformat(),
        },
        model_path,
    )

    report = {
        "project": "Floodora",
        "dataset_doi": "10.5281/zenodo.18486214",
        "paper_doi": "10.5194/nhess-26-5119-2026",
        "training_rows": len(X_train),
        "test_rows": len(X_test),
        "feature_count": X_train.shape[1],
        "validation_results": validation_results,
        "selected_model": best_name,
        "held_out_test_metrics": test_metrics,
        "limitations": [
            "Predicts research-derived urban flood-inundation labels.",
            "Does not directly predict drain blockage or live sensor readings.",
            "Test metrics are not proof of real-time flood forecasting.",
            "Independent local validation is required before real-world use.",
        ],
    }

    metrics_path.write_text(
        json.dumps(report, indent=2), encoding="utf-8"
    )

    print("\n=== FINAL HELD-OUT TEST RESULTS ===")
    print(f"Accuracy:  {test_metrics['accuracy']:.4f}")
    print(f"Precision: {test_metrics['precision']:.4f}")
    print(f"Recall:    {test_metrics['recall']:.4f}")
    print(f"F1-score:  {test_metrics['f1']:.4f}")
    print(f"ROC-AUC:   {test_metrics['roc_auc']:.4f}")
    print("Confusion matrix [true rows 0/1, predicted columns 0/1]:")
    print(test_metrics["confusion_matrix"])

    print(f"\nSaved model: {model_path}")
    print(f"Saved metrics: {metrics_path}")
    print(
        "\nReminder: these metrics measure performance on the supplied "
        "dataset, not validated real-world flood forecasting."
    )


if __name__ == "__main__":
    main()
