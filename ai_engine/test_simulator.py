
import unittest

from ai_engine.simulator import simulate_risk


class TestFloodoraSimulator(unittest.TestCase):

    def setUp(self):
        self.drain = {
            "water_level_cm": 75,
            "capacity_cm": 100,
            "rainfall_mm_h": 35,
            "blockage_pct": 65,
            "flow_drop_pct": 40,
        }

    def test_increased_rainfall_increases_risk(self):
        result = simulate_risk(
            self.drain,
            rainfall_mm_h=50
        )

        self.assertGreater(
            result["scenario_assessment"]["risk_score"],
            result["baseline_assessment"]["risk_score"]
        )

    def test_increased_blockage_increases_risk(self):
        result = simulate_risk(
            self.drain,
            blockage_pct=90
        )

        self.assertGreater(
            result["scenario_assessment"]["risk_score"],
            result["baseline_assessment"]["risk_score"]
        )

    def test_original_readings_are_unchanged(self):
        original = self.drain.copy()

        simulate_risk(
            self.drain,
            rainfall_mm_h=50,
            blockage_pct=80
        )

        self.assertEqual(self.drain, original)

    def test_no_changes_preserve_risk(self):
        result = simulate_risk(self.drain)

        self.assertEqual(
            result["baseline_assessment"]["risk_score"],
            result["scenario_assessment"]["risk_score"]
        )

        self.assertEqual(result["risk_change"], "UNCHANGED")

    def test_missing_reading_is_rejected(self):
        with self.assertRaises(ValueError):
            simulate_risk({"water_level_cm": 50})


if __name__ == "__main__":
    unittest.main()
