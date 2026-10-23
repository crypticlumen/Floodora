
from fastapi.testclient import TestClient

from backend.main import app
from backend.api import routes_inundation


client = TestClient(app)


class FakeModel:
    classes_ = [0, 1]

    def predict(self, X):
        return [1]

    def predict_proba(self, X):
        return [[0.4, 0.6]]


def make_payload():
    return {
        feature: 0.1
        for feature in routes_inundation.FEATURE_NAMES
    }


def test_inundation_prediction_success(monkeypatch):
    bundle = {
        "model": FakeModel(),
        "model_name": "TestModel",
        "feature_names": routes_inundation.FEATURE_NAMES,
    }

    monkeypatch.setattr(
        routes_inundation,
        "load_model_bundle",
        lambda: bundle,
    )

    response = client.post(
        "/api/flood-inundation/predict",
        json=make_payload(),
    )

    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] == 1
    assert data["prediction_label"] == "flood"
    assert data["model_name"] == "TestModel"
    assert data["flood_class_score"] == 0.6
    assert data["score_is_calibrated_probability"] is False


def test_inundation_prediction_missing_feature():
    payload = make_payload()
    payload.pop("DEM")

    response = client.post(
        "/api/flood-inundation/predict",
        json=payload,
    )

    assert response.status_code == 422


def test_inundation_prediction_rejects_extra_feature():
    payload = make_payload()
    payload["unexpected_feature"] = 10

    response = client.post(
        "/api/flood-inundation/predict",
        json=payload,
    )

    assert response.status_code == 422


def test_inundation_model_missing_returns_503(monkeypatch, tmp_path):
    monkeypatch.setattr(
        routes_inundation,
        "MODEL_PATH",
        tmp_path / "missing_model.joblib",
    )
    routes_inundation.load_model_bundle.cache_clear()

    try:
        response = client.post(
            "/api/flood-inundation/predict",
            json=make_payload(),
        )
        assert response.status_code == 503
    finally:
        routes_inundation.load_model_bundle.cache_clear()
