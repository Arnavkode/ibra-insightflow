package main

import (
	"fmt"
	"math"
)

func excludeIdentifierColumns(t *Table, idx []int) []int {
	var out []int
	for _, i := range idx {
		if !isIdentifierColumn(t.Columns[i]) {
			out = append(out, i)
		}
	}
	return out
}

// generateInsights derives observations directly from the cleaned table's
// computed stats: trend direction, strongest correlation, worst outlier
// column, and the dominant category in a categorical column. Nothing here
// is randomized or templated independent of the actual data.
func generateInsights(t *Table, s Summary) []string {
	var insights []string

	numericIdx := excludeIdentifierColumns(t, t.numericColumns())
	chronOrder := t.chronologicalOrder(t.dateColumnIndex())

	if ins := trendInsight(t, numericIdx, chronOrder); ins != "" {
		insights = append(insights, ins)
	}
	if ins := correlationInsight(t, numericIdx); ins != "" {
		insights = append(insights, ins)
	}
	if ins := outlierInsight(s); ins != "" {
		insights = append(insights, ins)
	}
	if ins := missingInsight(s); ins != "" {
		insights = append(insights, ins)
	}
	if ins := topCategoryInsight(s); ins != "" {
		insights = append(insights, ins)
	}

	if len(insights) == 0 {
		insights = append(insights, "Dataset does not contain enough numeric variation to derive trend or correlation insights.")
	}

	return insights
}

// trendInsight fits a simple linear regression of the first numeric column
// against row order (chronological order, if a date column was found) and
// reports the direction/magnitude of the slope.
func trendInsight(t *Table, numericIdx []int, order []int) string {
	if len(numericIdx) == 0 {
		return ""
	}
	idx := numericIdx[0]
	xs := t.floatColumnOrdered(idx, order)
	if len(xs) < 3 {
		return ""
	}
	slope, _ := linearRegression(xs)
	m := mean(xs)
	if m == 0 || math.IsNaN(m) {
		return ""
	}
	pctPerStep := slope / m * 100
	if math.Abs(pctPerStep) < 0.5 {
		return fmt.Sprintf("%s is relatively stable across records (~%.2f%% change per row).", t.Columns[idx], pctPerStep)
	}
	direction := "an increasing"
	if pctPerStep < 0 {
		direction = "a decreasing"
	}
	return fmt.Sprintf("%s shows %s trend of roughly %.2f%% per row across the dataset.", t.Columns[idx], direction, math.Abs(pctPerStep))
}

// correlationInsight finds the pair of numeric columns with the strongest
// absolute Pearson correlation and reports it, when there's enough signal.
func correlationInsight(t *Table, numericIdx []int) string {
	if len(numericIdx) < 2 {
		return ""
	}
	bestCorr := 0.0
	bestI, bestJ := -1, -1
	for a := 0; a < len(numericIdx); a++ {
		for b := a + 1; b < len(numericIdx); b++ {
			i, j := numericIdx[a], numericIdx[b]
			c := pairedCorrelation(t, i, j)
			if math.IsNaN(c) {
				continue
			}
			if math.Abs(c) > math.Abs(bestCorr) {
				bestCorr, bestI, bestJ = c, i, j
			}
		}
	}
	if bestI == -1 || math.Abs(bestCorr) < 0.5 {
		return ""
	}
	relation := "positively"
	if bestCorr < 0 {
		relation = "negatively"
	}
	return fmt.Sprintf("%s and %s are strongly %s correlated (r=%.2f).", t.Columns[bestI], t.Columns[bestJ], relation, bestCorr)
}

func outlierInsight(s Summary) string {
	worstCol, worstN := "", 0
	for col, vals := range s.Outliers {
		if len(vals) > worstN {
			worstCol, worstN = col, len(vals)
		}
	}
	if worstN == 0 {
		return ""
	}
	pct := float64(worstN) / float64(maxInt(s.Shape[0], 1)) * 100
	return fmt.Sprintf("%s has %d outlier value(s) beyond 3 standard deviations (%.1f%% of records) worth reviewing.", worstCol, worstN, pct)
}

func missingInsight(s Summary) string {
	worstCol, worstN := "", 0
	for _, col := range sortedKeys(s.Missing) {
		n := s.Missing[col]
		if n > worstN {
			worstCol, worstN = col, n
		}
	}
	if worstN == 0 {
		return ""
	}
	return fmt.Sprintf("%s had %d missing value(s) before cleaning; verify the source feed for that field.", worstCol, worstN)
}

func topCategoryInsight(s Summary) string {
	bestCol, bestShare := "", 0.0
	var bestTop string
	for col, cs := range s.Summary {
		if cs.Top == nil || cs.Freq == nil || cs.Count == 0 {
			continue
		}
		share := float64(*cs.Freq) / float64(cs.Count)
		if share > bestShare && share < 1.0 {
			bestCol, bestShare, bestTop = col, share, *cs.Top
		}
	}
	if bestCol == "" || bestShare < 0.4 {
		return ""
	}
	return fmt.Sprintf("In %s, \"%s\" accounts for %.0f%% of records — a concentration worth investigating.", bestCol, bestTop, bestShare*100)
}

// linearRegression returns the slope and intercept of y against its own
// row index (0..n-1) using ordinary least squares.
func linearRegression(ys []float64) (slope, intercept float64) {
	n := float64(len(ys))
	var sumX, sumY, sumXY, sumXX float64
	for i, y := range ys {
		x := float64(i)
		sumX += x
		sumY += y
		sumXY += x * y
		sumXX += x * x
	}
	denom := n*sumXX - sumX*sumX
	if denom == 0 {
		return 0, mean(ys)
	}
	slope = (n*sumXY - sumX*sumY) / denom
	intercept = (sumY - slope*sumX) / n
	return slope, intercept
}

func pairedCorrelation(t *Table, i, j int) float64 {
	var xs, ys []float64
	for _, row := range t.Rows {
		a, erra := parseFloatCell(row[i])
		b, errb := parseFloatCell(row[j])
		if erra != nil || errb != nil {
			continue
		}
		xs = append(xs, a)
		ys = append(ys, b)
	}
	if len(xs) < 3 {
		return math.NaN()
	}
	mx, my := mean(xs), mean(ys)
	var sxy, sxx, syy float64
	for k := range xs {
		dx, dy := xs[k]-mx, ys[k]-my
		sxy += dx * dy
		sxx += dx * dx
		syy += dy * dy
	}
	if sxx == 0 || syy == 0 {
		return math.NaN()
	}
	return sxy / math.Sqrt(sxx*syy)
}

func maxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}
