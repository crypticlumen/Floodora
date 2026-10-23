
# ai_engine/risk_engine.py

"""
Floodora drainage risk assessment engine.

This is a prototype heuristic, not a validated flood prediction model.
The weights and thresholds should be calibrated using real data.
"""


def calculate_risk(
    water_level_cm,
    capacity_cm,
    rainfall_mm_h,
    blockage_pct,
    flow_drop_pct=0
):
    """Return a risk score, risk level, contributing factors and action."""

    # Validate inputs
    if capacity_cm <= 0:
        raise ValueError("Capacity must be greater than zero.")

    if water_level_cm < 0:
        raise ValueError("Water level cannot be negative.")

    if rainfall_mm_h < 0:
        raise ValueError("Rainfall cannot be negative.")

    if not 0 <= blockage_pct <= 100:
        raise ValueError("Blockage must be between 0 and 100.")

    if not 0 <= flow_drop_pct <= 100:
        raise ValueError("Flow drop must be between 0 and 100.")

    # Normalize readings to a 0-100 scale
    water_fill_pct = min(
        100.0, (water_level_cm / capacity_cm) * 100
    )

    rainfall_score = min(
        100.0, (rainfall_mm_h / 50) * 100
    )

    # Weighted risk components
    components = {
        "water_level": water_fill_pct * 0.35,
        "blockage": blockage_pct * 0.25,
        "rainfall": rainfall_score * 0.20,
        "flow_drop": flow_drop_pct * 0.20,
    }

    raw_score = sum(components.values())
    score = min(100, int(raw_score + 0.5))

    # Risk classification
    if score < 25:
        level = "LOW"
    elif score < 50:
        level = "MEDIUM"
    elif score < 75:
        level = "HIGH"
    else:
        level = "CRITICAL"

    # Explain the contributing factors
    factors = []

    if water_fill_pct >= 70:
        factors.append("Water level is high relative to drain capacity.")

    if blockage_pct >= 50:
        factors.append("Significant drain blockage may restrict drainage.")

    if rainfall_mm_h >= 20:
        factors.append("Heavy rainfall may increase drainage pressure.")

    if flow_drop_pct >= 30:
        factors.append("Water flow has dropped significantly from baseline.")

    if not factors:
        factors.append("No major configured risk threshold was exceeded.")

    # Recommended response
    actions = {
        "LOW": "Continue routine monitoring.",
        "MEDIUM": "Monitor readings closely and schedule an inspection.",
        "HIGH": "Prioritize drain inspection and prepare a response team.",
        "CRITICAL": "Urgently verify conditions and initiate the emergency response protocol."
    }

    return {
        "risk_score": score,
        "risk_level": level,
        "risk_components": {
            key: round(value, 2)
            for key, value in components.items()
        },
        "factors": factors,
        "recommended_action": actions[level],
        "data_mode": "SIMULATED"
    }


if __name__ == "__main__":
    result = calculate_risk(
        water_level_cm=75,
        capacity_cm=100,
        rainfall_mm_h=35,
        blockage_pct=65,
        flow_drop_pct=40
    )

    print("FLOODORA - DRAINAGE RISK ASSESSMENT")
    print("=" * 38)
    print(f"Risk score: {result['risk_score']}/100")
    print(f"Risk level: {result['risk_level']}")

    print("\nRisk components:")
    for name, value in result["risk_components"].items():
        print(f"  {name}: {value}")

    print("\nContributing factors:")
    for factor in result["factors"]:
        print(f"  - {factor}")

    print("\nRecommended action:")
    print(f"  {result['recommended_action']}")
