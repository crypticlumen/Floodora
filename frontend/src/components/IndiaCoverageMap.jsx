
import { useEffect, useMemo, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { getIndiaLocations } from "../services/api.js";

function FitDistricts({ locations }) {
  const map = useMap();

  useEffect(() => {
    if (!locations.length) return;

    if (locations.length === 1) {
      map.setView(
        [locations[0].latitude, locations[0].longitude],
        8,
      );
      return;
    }

    map.fitBounds(
      locations.map((location) => [
        location.latitude,
        location.longitude,
      ]),
      { padding: [25, 25], maxZoom: 7 },
    );
  }, [map, locations]);

  return null;
}

export default function IndiaCoverageMap() {
  const [locations, setLocations] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("All States");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLocations() {
      try {
        setLoading(true);
        setError("");

        const data = await getIndiaLocations();

        if (cancelled) return;

        const valid = data.filter(
          (location) =>
            Number.isFinite(Number(location.latitude)) &&
            Number.isFinite(Number(location.longitude)),
        );

        setLocations(valid);

        setStates(
          [...new Set(valid.map((location) => location.state))]
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b)),
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Unable to load India's district catalogue.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLocations();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return locations.filter((location) => {
      const matchesState =
        selectedState === "All States" ||
        location.state === selectedState;

      const matchesSearch =
        !term ||
        `${location.name} ${location.state} ${location.location_id}`
          .toLowerCase()
          .includes(term);

      return matchesState && matchesSearch;
    });
  }, [locations, selectedState, search]);

  const selectedIsVisible = filtered.some(
    (location) => location.location_id === selectedLocation,
  );

  useEffect(() => {
    if (!selectedIsVisible) {
      setSelectedLocation(null);
    }
  }, [selectedIsVisible]);

  return (
    <div className="page-stack">
      <div className="filter-row">
        <div className="search-field">
          <input
            aria-label="Search districts"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search district, state, or ID..."
          />
        </div>

        <div className="filter-select">
          <select
            aria-label="Filter by state"
            value={selectedState}
            onChange={(event) => setSelectedState(event.target.value)}
          >
            <option>All States</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        <span className="result-count">
          {loading ? "Loading districts..." : `${filtered.length} districts`}
        </span>
      </div>

      {error && (
        <div className="demo-banner">
          <div>
            <strong>District catalogue unavailable</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {!error && (
        <div className="demo-banner">
          <div className="demo-banner-icon">i</div>
          <div>
            <strong>GEOGRAPHIC COVERAGE — NOT LIVE SENSOR COVERAGE</strong>
            <p>
              District markers show catalogue locations. They do not indicate
              live drainage sensors, current flood conditions, or verified
              flood predictions.
            </p>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-heading">
          <div>
            <h3>India District Coverage</h3>
            <p>
              Geographic reference points from the Floodora district catalogue
            </p>
          </div>
        </div>

        <div className="map-frame">
          {!loading && !error && (
            <MapContainer
              key="india-district-coverage"
              center={[22.5, 79]}
              zoom={5}
              minZoom={4}
              scrollWheelZoom
              className="leaflet-map"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <FitDistricts locations={filtered} />

              {filtered.map((location) => (
                <CircleMarker
                  key={location.location_id}
                  center={[
                    location.latitude,
                    location.longitude,
                  ]}
                  radius={
                    location.location_id === selectedLocation ? 8 : 4
                  }
                  pathOptions={{
                    color: "#ffffff",
                    weight: 1,
                    fillColor:
                      location.location_id === selectedLocation
                        ? "#e8a11b"
                        : "#1685b7",
                    fillOpacity: 0.85,
                  }}
                  eventHandlers={{
                    click: () =>
                      setSelectedLocation(location.location_id),
                  }}
                >
                  <Popup>
                    <div className="map-popup">
                      <strong>{location.name}</strong>
                      <p>State/UT: {location.state}</p>
                      <p>District ID: {location.location_id}</p>
                      <p>Type: {location.location_type}</p>
                      <p>Live drainage monitoring: Not confirmed</p>
                      <p>Live weather availability: Not confirmed</p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          )}

          {loading && (
            <div className="empty-state">
              <strong>Loading district locations...</strong>
            </div>
          )}
        </div>

        {!loading && !error && filtered.length === 0 && (
          <div className="empty-state">
            <strong>No matching districts</strong>
            <span>Try another district name or state.</span>
          </div>
        )}

        <div className="map-legend">
          <span>
            <i className="legend-dot low" />
            Geographic reference point
          </span>
          <span>
            <i className="legend-dot medium" />
            Selected district
          </span>
        </div>
      </div>
    </div>
  );
}
