
from functools import lru_cache
from pathlib import Path

import joblib
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict, Field


router = APIRouter()


MODEL_PATH = (
    Path(__file__).resolve().parents[2]
    / "ai_engine"
    / "models"
    / "flood_inundation_model.joblib"
)


FEATURE_NAMES = [
    "S2_B2", "S2_B3", "S2_B4", "S2_B8", "S2_B11",
    "NDVI", "NDWI", "MNDWI", "NDBI",
    "S1_VV", "S1_VH", "S1_VV_std", "S1_VH_std",
    "DEM", "Slope", "Aspect", "Precip_cum", "RNI", "REM",
]


class InundationPredictionInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    S2_B2: float = Field(allow_inf_nan=False)
    S2_B3: float = Field(allow_inf_nan=False)
    S2_B4: float = Field(allow_inf_nan=False)
    S2_B8: float = Field(allow_inf_nan=False)
    S2_B11: float = Field(allow_inf_nan=False)
    NDVI: float = Field(allow_inf_nan=False)
    NDWI: float = Field(allow_inf_nan=False)
    MNDWI: float = Field(allow_inf_nan=False)
    NDBI: float = Field(allow_inf_nan=False)
    S1_VV: float = Field(allow_inf_nan=False)
    S1_VH: float = Field(allow_inf_nan=False)
    S1_VV_std: float = Field(allow_inf_nan=False)
    S1_VH_std: float = Field(allow_inf_nan=False)
    DEM: float = Field(allow_inf_nan=False)
    Slope: float = Field(allow_inf_nan=False)
    Aspect: float = Field(allow_inf_nan=False)
    Precip_cum: float = Field(allow_inf_nan=False)
    RNI: float = Field(allow_inf_nan=False)
    REM: float = Field(allow_inf_nan=False)


class InundationPredictionResponse(BaseModel):
    prediction: int
    prediction_label: str
    model_name: str
    flood_class_score: float
    score_is_calibrated_probability: bool = False
    disclaimer: str


@lru_cache(maxsize=1)
def load_model_bundle():
    if not MODEL_PATH.is_file():
        raise HTTPException(
            status_code=503,
            detail="Flood inundation model is not available on this server.",
        )

    try:
        bundle = joblib.load(MODEL_PATH)

        if not isinstance(bundle, dict) or "model" not in bundle:
            raise ValueError("Invalid model bundle")

        if bundle.get("feature_names") != FEATURE_NAMES:
            raise ValueError("Model feature names do not match the API schema")

        return bundle

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail="Flood inundation model could not be loaded.",
        ) from exc


@router.post(
    "/flood-inundation/predict",
    response_model=InundationPredictionResponse,
)
def predict_inundation(payload: InundationPredictionInput):
    bundle = load_model_bundle()
    model = bundle["model"]

    try:
        row = pd.DataFrame(
            [payload.model_dump()],
            columns=bundle["feature_names"],
        )

        prediction = int(model.predict(row)[0])
        probabilities = model.predict_proba(row)[0]
        classes = list(model.classes_)
        flood_index = classes.index(1)
        flood_score = float(probabilities[flood_index])

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Flood inundation prediction failed.",
        ) from exc

    return InundationPredictionResponse(
        prediction=prediction,
        prediction_label="flood" if prediction == 1 else "non-flood",
        model_name=bundle["model_name"],
        flood_class_score=round(flood_score, 4),
        disclaimer=(
            "This model was trained on a research dataset. "
            "Its score is not a calibrated real-world flood probability "
            "and must not be used alone for emergency decisions."
        ),
    )
