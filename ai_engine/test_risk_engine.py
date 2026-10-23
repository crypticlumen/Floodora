
# ai_engine/test_risk_engine.py

import unittest

from ai_engine.risk_engine import calculate_risk


class TestFloodoraRiskEngine(unittest.TestCase):

    def test_low_risk(self):
        result = calculate_risk(
            water_level_cm=10,
            capacity_cm=100,
            rainfall_mm_h=2,
            blockage_pct=5,
            flow_drop_pct=0
        )

        self.assertEqual(result["risk_level"], "LOW")
        self.assertLess(result["risk_score"], 25)

    def test_medium_risk(self):
        result = calculate_risk(
            water_level_cm=50,
            capacity_cm=100,
            rainfall_mm_h=10,
            blockage_pct=30,
            flow_drop_pct=20
        )

        self.assertEqual(result["risk_level"], "MEDIUM")
        self.assertGreaterEqual(result["risk_score"], 25)
        self.assertLess(result["risk_score"], 50)

    def test_high_risk(self):
        result = calculate_risk(
            water_level_cm=75,
            capacity_cm=100,
            rainfall_mm_h=35,
            blockage_pct=65,
            flow_drop_pct=40
        )

        self.assertEqual(result["risk_level"], "HIGH")
        self.assertEqual(result["risk_score"], 65)

    def test_critical_risk(self):
        result = calculate_risk(
            water_level_cm=100,
            capacity_cm=100,
            rainfall_mm_h=50,
            blockage_pct=100,
            flow_drop_pct=100
        )

        self.assertEqual(result["risk_level"], "CRITICAL")
        self.assertEqual(result["risk_score"], 100)

    def test_explanations_and_action_exist(self):
        result = calculate_risk(
            water_level_cm=75,
            capacity_cm=100,
            rainfall_mm_h=35,
            blockage_pct=65,
            flow_drop_pct=40
        )

        self.assertTrue(result["factors"])
        self.assertTrue(result["recommended_action"])
        self.assertEqual(result["data_mode"], "SIMULATED")

    def test_invalid_capacity(self):
        with self.assertRaises(ValueError):
            calculate_risk(10, 0, 5, 10)

    def test_invalid_blockage(self):
        with self.assertRaises(ValueError):
            calculate_risk(10, 100, 5, 110)

    def test_invalid_flow_drop(self):
        with self.assertRaises(ValueError):
            calculate_risk(10, 100, 5, 10, -1)

    def test_negative_rainfall(self):
        with self.assertRaises(ValueError):
            calculate_risk(10, 100, -5, 10)

    def test_negative_water_level(self):
        with self.assertRaises(ValueError):
            calculate_risk(-1, 100, 5, 10)


if __name__ == "__main__":
    unittest.main()
