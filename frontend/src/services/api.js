const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Floodora API error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

export async function getHealth() {
  return request("/api/health");
}

export async function getLocations() {
  const result = await request("/api/locations");
  return Array.isArray(result) ? result : result.value;
}

export async function getIndiaLocations(state) {
  const query = state ? `?state=${encodeURIComponent(state)}` : "";

  const result = await request(`/api/india/locations${query}`);

  return Array.isArray(result) ? result : result.value;
}

export async function assessRisk(readings) {
  return request("/api/assess", {
    method: "POST",
    body: JSON.stringify(readings),
  });
}


export async function getBackendDrains() {
  const locations = await getLocations();

  return Promise.all(
    locations.map(async (location, index) => {
      const readings = location.current_readings;
      const dataMode = readings.data_mode || "simulated";
      const isVerifiedLive = dataMode === "live" && Boolean(readings.timestamp);

      const assessment = await assessRisk({
        ...readings,
        location_id: location.location_id,
        location_name: location.name,
        data_mode: dataMode,
      });

      const hasCapacity =
        Number.isFinite(readings.capacity_cm) &&
        readings.capacity_cm > 0;

      const hasWaterLevel =
        Number.isFinite(readings.water_level_cm) &&
        readings.water_level_cm >= 0;

      const waterLevel =
        hasCapacity && hasWaterLevel
          ? Math.round(
              (readings.water_level_cm / readings.capacity_cm) * 100,
            )
          : null;

      const risk =
        assessment.risk_level === "CRITICAL"
          ? "Critical"
          : assessment.risk_level === "HIGH"
            ? "High"
            : assessment.risk_level === "MEDIUM"
              ? "Medium"
              : "Low";

      return {
        id: location.location_id,
        location: location.name,
        area: `${location.ward}, ${location.city}`,
        lat: location.latitude,
        lng: location.longitude,

        waterLevel,
        waterLevelCm: hasWaterLevel ? readings.water_level_cm : null,
        capacityCm: hasCapacity ? readings.capacity_cm : null,

        // Flow rate cannot be derived reliably from flow-drop percentage.
        flowRate: null,
        flowDropPct: readings.flow_drop_pct ?? null,

        rainfall: readings.rainfall_mm_h ?? null,
        normalFlow: null,
        riseRate: null,

        blockagePct: readings.blockage_pct ?? null,
        blockageStatus:
          readings.blockage_pct == null
            ? "Unavailable"
            : readings.blockage_pct >= 50
              ? "Suspected"
              : readings.blockage_pct >= 25
                ? "Possible"
                : "Clear",

        lastUpdated: readings.timestamp || null,
        risk,
        riskScore: assessment.risk_score,
        reasons: assessment.factors || [],
        action: Array.isArray(assessment.recommended_action)
          ? assessment.recommended_action.join(" ")
          : assessment.recommended_action,

        dataMode,
        source: "backend",
        sourceVerified: isVerifiedLive,
        sourceStatus: isVerifiedLive
          ? "Live source declared; verification required"
          : "Simulated or unverified data",

        backendLocationId: location.location_id,
        backendAssessment: assessment,
        displayIndex: index + 1,
      };
    }),
  );
}
