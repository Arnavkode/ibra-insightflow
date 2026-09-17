package main

import (
	"fmt"
	"testing"
	"time"
)

func TestRunMLAnalysisEndToEnd(t *testing.T) {
	table := &Table{
		Columns: []string{"date", "customer_id", "revenue", "profit", "region", "converted"},
	}
	start := time.Date(2025, time.January, 1, 0, 0, 0, 0, time.UTC)
	regions := []string{"north", "south", "east", "west"}
	for i := 0; i < 40; i++ {
		revenue := 1000 + i*25
		profit := float64(revenue) * (0.20 + float64(i%4)*0.01)
		converted := 0
		if i%3 == 0 || revenue > 1700 {
			converted = 1
		}
		table.Rows = append(table.Rows, []string{
			start.AddDate(0, 0, i).Format("2006-01-02"),
			fmt.Sprintf("C-%04d", i),
			fmt.Sprintf("%d", revenue),
			fmt.Sprintf("%.2f", profit),
			regions[i%len(regions)],
			fmt.Sprintf("%d", converted),
		})
	}

	report := runMLAnalysis(table, "sales")
	if report.Status == "unavailable" {
		t.Skipf("ML dependencies unavailable: %s", report.Message)
	}
	if report.Status != "trained" {
		t.Fatalf("expected trained ML report, got %q: %s", report.Status, report.Message)
	}
	for _, key := range []string{"predicted_next_revenue", "predicted_next_profit", "predicted_conversion_rate"} {
		if _, ok := report.Predictions[key]; !ok {
			t.Errorf("missing %s in predictions: %#v", key, report.Predictions)
		}
	}
}
