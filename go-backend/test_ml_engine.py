import math
import unittest
from datetime import date, timedelta

import ml_engine


class MLEngineTests(unittest.TestCase):
    def test_trains_forecast_and_classification_models(self):
        columns = ["date", "customer_id", "revenue", "profit", "region", "converted"]
        rows = []
        start = date(2025, 1, 1)
        for i in range(48):
            revenue = 1000 + (i * 24) + (80 if i % 7 == 0 else 0)
            profit = revenue * (0.20 + ((i % 5) * 0.01))
            converted = 1 if (i % 3 == 0 or revenue > 1850) else 0
            rows.append(
                [
                    (start + timedelta(days=i)).isoformat(),
                    str(1000 + i),
                    str(revenue),
                    str(profit),
                    ["north", "south", "east", "west"][i % 4],
                    str(converted),
                ]
            )

        result = ml_engine.analyse({"columns": columns, "rows": rows, "dataset_type": "sales"})

        self.assertEqual(result["status"], "trained")
        self.assertIn("predicted_next_revenue", result["predictions"])
        self.assertIn("predicted_next_profit", result["predictions"])
        self.assertIn("predicted_conversion_rate", result["predictions"])
        for prediction in result["predictions"].values():
            self.assertTrue(math.isfinite(prediction["value"]))
            self.assertGreater(prediction["training_rows"], 0)

    def test_skips_tiny_dataset_instead_of_inventing_prediction(self):
        result = ml_engine.analyse(
            {
                "columns": ["date", "revenue"],
                "rows": [[f"2025-01-0{i}", str(100 * i)] for i in range(1, 6)],
                "dataset_type": "sales",
            }
        )

        self.assertEqual(result["status"], "skipped")
        self.assertEqual(result["predictions"], {})
        self.assertIn("enough suitable data", result["message"])


if __name__ == "__main__":
    unittest.main()
