
import json
from pathlib import Path

from pyproj import Transformer
from shapely.geometry import shape

ROOT = Path(__file__).resolve().parents[1]

SOURCE = ROOT / "backend" / "data" / "district_nwic.GeoJSON"
OUTPUT = ROOT / "backend" / "data" / "india_districts.json"

# NWIC district dataset uses EPSG:7755.
# Floodora's map/API will use WGS84 longitude and latitude.
transformer = Transformer.from_crs(
    "EPSG:7755",
    "EPSG:4326",
    always_xy=True,
)

print(f"Reading: {SOURCE}")

with SOURCE.open("r", encoding="utf-8") as file:
    dataset = json.load(file)

features = dataset.get("features", [])
districts = []
seen = set()
skipped = 0

for feature in features:
    properties = feature.get("properties") or {}
    geometry_data = feature.get("geometry")

    district_name = properties.get("district")
    state_name = properties.get("state_name")

    if not district_name or not state_name or not geometry_data:
        skipped += 1
        continue

    try:
        geometry = shape(geometry_data)

        if geometry.is_empty:
            skipped += 1
            continue

        # A point inside the district is better for a map marker
        # than a centroid that could fall outside its boundary.
        point = geometry.representative_point()

        longitude, latitude = transformer.transform(
            point.x,
            point.y,
        )

        if not (
            -180 <= longitude <= 180
            and -90 <= latitude <= 90
        ):
            skipped += 1
            continue

        district_code = str(properties.get("dtcode") or "").strip()
        state_code = str(properties.get("stcode") or "").strip()

        record_key = (
            state_name.strip().casefold(),
            district_name.strip().casefold(),
            district_code,
        )

        if record_key in seen:
            continue

        seen.add(record_key)

        districts.append({
            "location_id": (
                f"IN-{state_code}-{district_code}"
                if state_code and district_code
                else f"IN-{len(districts) + 1:04d}"
            ),
            "name": district_name.strip(),
            "state": state_name.strip(),
            "state_code": state_code,
            "district_code": district_code,
            "latitude": round(latitude, 6),
            "longitude": round(longitude, 6),
            "location_type": "district",
            "weather_available": False,
            "live_drainage_monitoring": False,
        })

    except Exception as error:
        skipped += 1
        print(f"Skipped {district_name!r}: {error}")

districts.sort(
    key=lambda item: (
        item["state"].casefold(),
        item["name"].casefold(),
    )
)

OUTPUT.parent.mkdir(parents=True, exist_ok=True)

with OUTPUT.open("w", encoding="utf-8") as file:
    json.dump(districts, file, ensure_ascii=False, indent=2)

print("\nProcessing complete.")
print(f"Input features: {len(features)}")
print(f"District records: {len(districts)}")
print(f"Skipped features: {skipped}")
print(f"Output file: {OUTPUT}")
print("Original GeoJSON was not modified.")
