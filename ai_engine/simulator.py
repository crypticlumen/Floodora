
# ai_engine/simulator.py

"""
Floodora what-if simulator.

Changes simulated rainfall or blockage and compares the resulting
risk assessment with the original readings.
"""

from ai_engine.risk_engine import calculate_risk


def simulate_risk(
    drain_readings,
    rainfall_mm_h=None,
    blockage_pct=None
):
    """
    Simulate a scenario without modifying the original readings.

    drain_readings must contain:
        water_level_cm, capacity_cm, rainfall_mm_h, blockage_pct

    flow_drop_pct is optional and defaults to 0.
    """

    required_fields = {
        "water_level_cm",
        "capacity_cm",
        "rainfall_mm_h",
        "blockage_pct",
    }

    missing = required_fields - drain_readings.keys()

    if missing:
        raise ValueError(
            f"Missing required readings: {', '.join(sorted(missing))}"
        )

    # Keep only fields supported by the risk engine.
    original = {
        "water_level_cm": drain_readings["water_level_cm"],
        "capacity_cm": drain_readings["capacity_cm"],
        "rainfall_mm_h": drain_readings["rainfall_mm_h"],
        "blockage_pct": drain_readings["blockage_pct"],
        "flow_drop_pct": drain_readings.get("flow_drop_pct", 0),
    }

    # Make a separate copy for the scenario.
    scenario = original.copy()

    if rainfall_mm_h is not None:
        scenario["rainfall_mm_h"] = rainfall_mm_h

    if blockage_pct is not None:
        scenario["blockage_pct"] = blockage_pct

    # Assess both sets of readings.
    baseline_result = calculate_risk(**original)
    scenario_result = calculate_risk(**scenario)

    score_change = (
        scenario_result["risk_score"]
        - baseline_result["risk_score"]
    )

    if score_change > 0:
        direction = "INCREASED"
    elif score_change < 0:
        direction = "DECREASED"
    else:
        direction = "UNCHANGED"

    return {
        "baseline_readings": original,
        "scenario_readings": scenario,
        "baseline_assessment": baseline_result,
        "scenario_assessment": scenario_result,
        "risk_score_change": score_change,
        "risk_change": direction,
        "data_mode": "SIMULATED",
    }


if __name__ == "__main__":
    drain = {
        "water_level_cm": 75,
        "capacity_cm": 100,
        "rainfall_mm_h": 35,
        "blockage_pct": 65,
        "flow_drop_pct": 40,
    }

    result = simulate_risk(
        drain_readings=drain,
        rainfall_mm_h=50,
        blockage_pct=80,
    )

    print("FLOODORA - WHAT-IF SIMULATION")
    print("=" * 32)

    print(
        "Baseline risk:",
        result["baseline_assessment"]["risk_score"],
        result["baseline_assessment"]["risk_level"],
    )

    print(
        "Scenario risk:",
        result["scenario_assessment"]["risk_score"],
        result["scenario_assessment"]["risk_level"],
    )

    print("Score change:", result["risk_score_change"])
    print("Risk change:", result["risk_change"])

    print("Original readings unchanged:", drain["rainfall_mm_h"] == 35)
