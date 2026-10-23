
"""Nationwide geographic locations API for Floodora."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

from fastapi import APIRouter, HTTPException, Query

from backend.models import IndiaLocation

router = APIRouter(
    prefix="/india",
    tags=["India Geographic Coverage"],
)

DATA_FILE = (
    Path(__file__).resolve().parents[1]
    / "data"
    / "india_districts.json"
)


@lru_cache(maxsize=1)
def load_india_locations() -> tuple[IndiaLocation, ...]:
    """Load and cache district records from the generated catalogue."""
    try:
        with DATA_FILE.open("r", encoding="utf-8") as file:
            records = json.load(file)

        return tuple(
            IndiaLocation(**record)
            for record in records
        )

    except FileNotFoundError as exc:
        raise RuntimeError(
            f"District catalogue not found: {DATA_FILE}"
        ) from exc

    except (json.JSONDecodeError, ValueError) as exc:
        raise RuntimeError(
            "The India district catalogue is invalid."
        ) from exc


@router.get(
    "/locations",
    response_model=list[IndiaLocation],
    summary="List district locations across India",
)
def get_india_locations(
    state: str | None = Query(
        default=None,
        description="Filter by state or union territory name",
    ),
) -> list[IndiaLocation]:
    """Return geographic district locations, not live monitoring data."""
    try:
        locations = load_india_locations()
    except RuntimeError as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc),
        ) from exc

    if state is None:
        return list(locations)

    normalized_state = state.strip().casefold()

    return [
        location
        for location in locations
        if location.state.casefold() == normalized_state
    ]
