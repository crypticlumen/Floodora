"""Main FastAPI application entrypoint for Floodora Backend.

Smart Drainage Monitoring & Early Flood-Risk Awareness Backend.
"""

from __future__ import annotations

from typing import Any, Dict
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes_risk import router as risk_router

APP_METADATA = {
    "title": "Floodora Backend API",
    "description": (
        "Backend REST API for Floodora: Smart Drainage Monitoring & Early Flood-Risk Awareness.\n\n"
        "Features:\n"
        "- Rule-based explainable drainage risk assessment (F-01, F-02, F-04)\n"
        "- What-if scenario simulator for rainfall and blockage overrides (F-03)\n"
        "- Pre-configured Mumbai flood hotspots and demonstration scenarios\n"
        "- Historical assessment session logging\n\n"
        "Important: Floodora provides decision-support prototype indicators and does not replace official emergency services."
    ),
    "version": "1.0.0",
}

app = FastAPI(
    title=APP_METADATA["title"],
    description=APP_METADATA["description"],
    version=APP_METADATA["version"],
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS for frontend dashboard access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes
app.include_router(risk_router, prefix="/api")


@app.get("/", summary="Root status and welcome", tags=["System"])
def root() -> Dict[str, Any]:
    return {
        "name": "Floodora Backend API",
        "version": APP_METADATA["version"],
        "status": "online",
        "documentation": "/docs",
        "system_summary": "Smart Drainage Monitoring & Early Flood-Risk Awareness Decision Support Platform",
    }


@app.get("/api/health", summary="Health check endpoint", tags=["System"])
def health_check() -> Dict[str, Any]:
    return {
        "status": "healthy",
        "risk_engine": "operational",
        "scenario_simulator": "operational",
        "version": APP_METADATA["version"],
    }
