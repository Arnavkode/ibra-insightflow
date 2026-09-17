package main

import (
	"math"
	"sort"
	"strings"
)

type ColumnStats struct {
	Count  int      `json:"count"`
	Mean   *float64 `json:"mean,omitempty"`
	Std    *float64 `json:"std,omitempty"`
	Min    *float64 `json:"min,omitempty"`
	Max    *float64 `json:"max,omitempty"`
	Unique *int     `json:"unique,omitempty"`
	Top    *string  `json:"top,omitempty"`
	Freq   *int     `json:"freq,omitempty"`
}

type Summary struct {
	Shape    [2]int                 `json:"shape"`
	Columns  []string               `json:"columns"`
	Summary  map[string]ColumnStats `json:"summary"`
	Missing  map[string]int         `json:"missing"`
	Outliers map[string][]float64   `json:"outliers"`
}

type AnalysisResult struct {
	Summary  Summary            `json:"summary"`
	KPIs     map[string]float64 `json:"kpis"`
	ML       MLReport           `json:"ml"`
	Type     string             `json:"type"`
	Insights []string           `json:"insights"`
	Error    string             `json:"error,omitempty"`
}

func missingCounts(t *Table) map[string]int {
	out := make(map[string]int, len(t.Columns))
	for i, col := range t.Columns {
		n := 0
		for _, row := range t.Rows {
			if isEmpty(row[i]) {
				n++
			}
		}
		out[col] = n
	}
	return out
}

func computeSummary(raw, cleaned *Table) Summary {
	numeric := map[int]bool{}
	for _, i := range cleaned.numericColumns() {
		numeric[i] = true
	}

	stats := make(map[string]ColumnStats, len(cleaned.Columns))
	outliers := make(map[string][]float64)

	for i, col := range cleaned.Columns {
		if numeric[i] {
			xs := cleaned.floatColumn(i)
			cs := ColumnStats{Count: len(xs)}
			m, sd := 0.0, 0.0
			if len(xs) > 0 {
				m, sd = mean(xs), stddev(xs)
				lo, hi := minMax(xs)
				cs.Mean, cs.Std, cs.Min, cs.Max = ptr(m), ptr(sd), ptr(lo), ptr(hi)
			}
			stats[col] = cs

			if sd > 0 {
				out := []float64{}
				for _, x := range xs {
					if math.Abs(x-m) > 3*sd {
						out = append(out, x)
					}
				}
				outliers[col] = out
			} else {
				outliers[col] = []float64{}
			}
		} else {
			counts := map[string]int{}
			nonEmpty := 0
			for _, row := range cleaned.Rows {
				v := row[i]
				if isEmpty(v) {
					continue
				}
				nonEmpty++
				counts[v]++
			}
			topVal, topFreq := "", 0
			for v, c := range counts {
				if c > topFreq {
					topVal, topFreq = v, c
				}
			}
			cs := ColumnStats{Count: nonEmpty, Unique: ptr(len(counts))}
			if topFreq > 0 {
				cs.Top = ptr(topVal)
				cs.Freq = ptr(topFreq)
			}
			stats[col] = cs
		}
	}

	return Summary{
		Shape:    [2]int{len(cleaned.Rows), len(cleaned.Columns)},
		Columns:  cleaned.Columns,
		Summary:  stats,
		Missing:  missingCounts(raw),
		Outliers: outliers,
	}
}

func ptr[T any](v T) *T { return &v }

// isIdentifierColumn reports whether a column looks like a row/record
// identifier (e.g. "Row ID", "Order ID", "customer_id", "employeeId")
// rather than a measure. Two ID columns are often perfectly correlated
// purely because both are sequential/unique keys, which is a real but
// useless "insight" - so these are excluded from trend/correlation
// analysis and generic average KPIs, while still appearing in the raw
// summary stats. Word-boundary tokenization avoids false positives on
// words that merely end in "id" (valid, paid, grid, solid, ...).
func isIdentifierColumn(name string) bool {
	for _, tok := range tokenizeColumnName(name) {
		if tok == "id" || tok == "no" || tok == "num" {
			return true
		}
	}
	return false
}

// tokenizeColumnName splits on non-alphanumeric characters and camelCase
// boundaries, returning lowercase tokens.
func tokenizeColumnName(name string) []string {
	var tokens []string
	var cur strings.Builder
	runes := []rune(name)
	flush := func() {
		if cur.Len() > 0 {
			tokens = append(tokens, strings.ToLower(cur.String()))
			cur.Reset()
		}
	}
	for i, r := range runes {
		switch {
		case !((r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9')):
			flush()
		case i > 0 && r >= 'A' && r <= 'Z' && runes[i-1] >= 'a' && runes[i-1] <= 'z':
			flush()
			cur.WriteRune(r)
		default:
			cur.WriteRune(r)
		}
	}
	flush()
	return tokens
}

// --- dataset type detection ---

func detectType(columns []string) string {
	lower := make([]string, len(columns))
	for i, c := range columns {
		lower[i] = strings.ToLower(c)
	}
	has := func(needles ...string) bool {
		for _, c := range lower {
			for _, n := range needles {
				if strings.Contains(c, n) {
					return true
				}
			}
		}
		return false
	}
	if has("sales", "revenue") {
		return "sales"
	}
	if has("employee", "hr", "attrition", "churn") {
		return "hr"
	}
	if has("customer", "marketing", "campaign", "conversion") {
		return "marketing"
	}
	return "generic"
}

// findColumn does fuzzy, synonym-aware matching of a logical field name
// (e.g. "revenue") against the actual column headers, so KPI computation
// doesn't hard-fail just because a dataset says "total_sales" instead.
func findColumn(columns []string, synonyms []string) int {
	for i, c := range columns {
		norm := strings.ToLower(strings.ReplaceAll(strings.ReplaceAll(c, "_", ""), " ", ""))
		for _, syn := range synonyms {
			if strings.Contains(norm, syn) {
				return i
			}
		}
	}
	return -1
}

var (
	revenueSynonyms = []string{"revenue", "sales", "totalsales", "income", "amount"}
	profitSynonyms  = []string{"profit", "netprofit", "margin"}
	leftSynonyms    = []string{"employeeleft", "attrition", "churned", "left", "terminated"}
	convertSynonyms = []string{"converted", "conversion", "isconverted", "purchase"}
)

func computeKPIs(t *Table, dtype string) map[string]float64 {
	kpis := map[string]float64{}

	dateIdx := t.dateColumnIndex()

	switch dtype {
	case "sales":
		if ri := findColumn(t.Columns, revenueSynonyms); ri >= 0 {
			rev := t.floatColumn(ri)
			// revenue_growth means month-over-month change; only compute
			// it when there's a real date column to bucket by, rather
			// than the misleading row-to-row change between individual
			// transactions.
			if g, ok := monthlyGrowth(t, ri, dateIdx); ok {
				kpis["revenue_growth"] = g
			}
			kpis["total_revenue"] = sum(rev)
			if pi := findColumn(t.Columns, profitSynonyms); pi >= 0 {
				profit := t.floatColumn(pi)
				mr := mean(rev)
				if len(profit) > 0 && mr != 0 && !math.IsNaN(mr) {
					kpis["profit_margin"] = mean(profit) / mr
				}
			}
		}
	case "hr":
		if li := findColumn(t.Columns, leftSynonyms); li >= 0 {
			left := t.floatColumn(li)
			if len(left) > 0 {
				kpis["churn_rate"] = sum(left) / float64(len(left))
			}
		}
	case "marketing":
		if ci := findColumn(t.Columns, convertSynonyms); ci >= 0 {
			conv := t.floatColumn(ci)
			if len(conv) > 0 {
				kpis["conversion_rate"] = sum(conv) / float64(len(conv))
			}
		}
	}

	// Generic fallback KPIs always computed so a dataset that doesn't match
	// any known domain (or is missing the expected columns) still gets
	// real, data-derived numbers instead of an empty KPI set.
	kpis["row_count"] = float64(len(t.Rows))
	for _, idx := range t.numericColumns() {
		if isIdentifierColumn(t.Columns[idx]) {
			continue
		}
		xs := t.floatColumn(idx)
		if len(xs) == 0 {
			continue
		}
		key := "avg_" + normalizeKey(t.Columns[idx])
		if _, exists := kpis[key]; !exists {
			kpis[key] = mean(xs)
		}
	}

	return kpis
}

func normalizeKey(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	s = strings.ReplaceAll(s, " ", "_")
	return s
}

func sum(xs []float64) float64 {
	s := 0.0
	for _, x := range xs {
		s += x
	}
	return s
}

// monthlyGrowth computes mean month-over-month percent change of a value
// column, bucketed by a date column. This is what "revenue growth" means
// in practice — period-over-period comparison, not the row-to-row percent
// change between individual transactions (which is dominated by noise and
// isn't meaningful unless each row already represents one time period).
// Returns false if there's no usable date column or fewer than two
// distinct periods, rather than falling back to a misleading number.
func monthlyGrowth(t *Table, valueIdx, dateIdx int) (float64, bool) {
	if dateIdx < 0 {
		return 0, false
	}
	buckets := map[string]float64{}
	for _, row := range t.Rows {
		d, ok := parseDateCell(row[dateIdx])
		if !ok {
			continue
		}
		v, err := parseFloatCell(row[valueIdx])
		if err != nil {
			continue
		}
		buckets[d.Format("2006-01")] += v
	}
	if len(buckets) < 2 {
		return 0, false
	}
	months := make([]string, 0, len(buckets))
	for m := range buckets {
		months = append(months, m)
	}
	sort.Strings(months)
	series := make([]float64, len(months))
	for i, m := range months {
		series[i] = buckets[m]
	}
	return pctChangeMean(series)
}

func pctChangeMean(xs []float64) (float64, bool) {
	if len(xs) < 2 {
		return 0, false
	}
	var changes []float64
	for i := 1; i < len(xs); i++ {
		if xs[i-1] == 0 {
			continue
		}
		changes = append(changes, (xs[i]-xs[i-1])/xs[i-1])
	}
	if len(changes) == 0 {
		return 0, false
	}
	return mean(changes), true
}

func sortedKeys(m map[string]int) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	return keys
}
