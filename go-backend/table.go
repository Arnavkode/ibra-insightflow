package main

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"math"
	"os"
	"sort"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/xuri/excelize/v2"
)

// Table is a minimal in-memory dataframe: string cells, row-major.
type Table struct {
	Columns []string
	Rows    [][]string
}

func loadTable(path string) (*Table, error) {
	lower := strings.ToLower(path)
	if strings.HasSuffix(lower, ".xlsx") || strings.HasSuffix(lower, ".xls") {
		return loadExcel(path)
	}
	if t, err := loadExcel(path); err == nil {
		return t, nil
	}
	return loadCSV(path)
}

func loadCSV(path string) (*Table, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("file read error: %w", err)
	}
	raw = normalizeLineEndings(raw)
	raw = ensureUTF8(raw)

	r := csv.NewReader(bytes.NewReader(raw))
	r.FieldsPerRecord = -1
	records, err := r.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("file read error: %w", err)
	}
	if len(records) == 0 {
		return nil, fmt.Errorf("file read error: empty file")
	}
	t := &Table{Columns: records[0]}
	for _, row := range records[1:] {
		row = normalizeRowWidth(row, len(t.Columns))
		t.Rows = append(t.Rows, row)
	}
	return t, nil
}

func loadExcel(path string) (*Table, error) {
	f, err := excelize.OpenFile(path)
	if err != nil {
		return nil, fmt.Errorf("file read error: %w", err)
	}
	defer f.Close()

	sheets := f.GetSheetList()
	if len(sheets) == 0 {
		return nil, fmt.Errorf("file read error: no sheets found")
	}
	rows, err := f.GetRows(sheets[0])
	if err != nil {
		return nil, fmt.Errorf("file read error: %w", err)
	}
	if len(rows) == 0 {
		return nil, fmt.Errorf("file read error: empty sheet")
	}
	t := &Table{Columns: rows[0]}
	for _, row := range rows[1:] {
		row = normalizeRowWidth(row, len(t.Columns))
		t.Rows = append(t.Rows, row)
	}
	return t, nil
}

// normalizeLineEndings converts CRLF and old Mac-style bare-CR line endings
// (still seen in exports from legacy tools/Excel) to plain LF, which is the
// only form encoding/csv splits records on reliably.
func normalizeLineEndings(data []byte) []byte {
	data = bytes.ReplaceAll(data, []byte("\r\n"), []byte("\n"))
	data = bytes.ReplaceAll(data, []byte("\r"), []byte("\n"))
	return data
}

// ensureUTF8 transcodes Latin-1 (ISO-8859-1) data to UTF-8 when the input
// isn't already valid UTF-8. Latin-1 is the common legacy encoding for CSV
// exports from older spreadsheet tools; each byte maps 1:1 to the same
// Unicode code point, so no external decoder is needed.
func ensureUTF8(data []byte) []byte {
	if utf8.Valid(data) {
		return data
	}
	var b bytes.Buffer
	b.Grow(len(data) * 2)
	for _, c := range data {
		b.WriteRune(rune(c))
	}
	return b.Bytes()
}

func normalizeRowWidth(row []string, width int) []string {
	if len(row) == width {
		return row
	}
	out := make([]string, width)
	copy(out, row)
	return out
}

func (t *Table) colIndex(name string) int {
	for i, c := range t.Columns {
		if c == name {
			return i
		}
	}
	return -1
}

// isEmpty reports whether a raw cell counts as missing.
func isEmpty(v string) bool {
	return strings.TrimSpace(v) == ""
}

// numericColumns returns the indices of columns where the large majority of
// non-empty values parse as numbers.
func (t *Table) numericColumns() []int {
	var out []int
	for i := range t.Columns {
		total, numeric := 0, 0
		for _, row := range t.Rows {
			v := strings.TrimSpace(row[i])
			if v == "" {
				continue
			}
			total++
			if _, err := strconv.ParseFloat(v, 64); err == nil {
				numeric++
			}
		}
		if total > 0 && float64(numeric)/float64(total) >= 0.9 {
			out = append(out, i)
		}
	}
	return out
}

func parseFloatCell(v string) (float64, error) {
	return strconv.ParseFloat(strings.TrimSpace(v), 64)
}

var dateLayouts = []string{
	"2006-01-02", "2006-01-02T15:04:05", "1/2/2006", "01/02/2006",
	"2/1/2006", "02/01/2006", "Jan 2, 2006", "January 2, 2006",
}

func parseDateCell(v string) (time.Time, bool) {
	v = strings.TrimSpace(v)
	for _, layout := range dateLayouts {
		if t, err := time.Parse(layout, v); err == nil {
			return t, true
		}
	}
	return time.Time{}, false
}

// dateColumnIndex finds the first column that looks like a date field by
// name and where most non-empty values actually parse as dates.
func (t *Table) dateColumnIndex() int {
	for i, col := range t.Columns {
		if !strings.Contains(strings.ToLower(col), "date") {
			continue
		}
		total, parsed := 0, 0
		for _, row := range t.Rows {
			v := strings.TrimSpace(row[i])
			if v == "" {
				continue
			}
			total++
			if _, ok := parseDateCell(v); ok {
				parsed++
			}
		}
		if total > 0 && float64(parsed)/float64(total) >= 0.9 {
			return i
		}
	}
	return -1
}

// chronologicalOrder returns row indices sorted by the given date column,
// or nil (meaning "use existing row order") if the column doesn't parse
// consistently enough to sort by.
func (t *Table) chronologicalOrder(dateIdx int) []int {
	if dateIdx < 0 {
		return nil
	}
	order := make([]int, len(t.Rows))
	dates := make([]time.Time, len(t.Rows))
	for i, row := range t.Rows {
		order[i] = i
		if d, ok := parseDateCell(row[dateIdx]); ok {
			dates[i] = d
		}
	}
	sort.SliceStable(order, func(a, b int) bool {
		return dates[order[a]].Before(dates[order[b]])
	})
	return order
}

// floatColumnOrdered is like floatColumn but visits rows in the given
// order (e.g. chronological order) instead of file order.
func (t *Table) floatColumnOrdered(idx int, order []int) []float64 {
	if order == nil {
		return t.floatColumn(idx)
	}
	var out []float64
	for _, rowIdx := range order {
		v := strings.TrimSpace(t.Rows[rowIdx][idx])
		if v == "" {
			continue
		}
		f, err := strconv.ParseFloat(v, 64)
		if err != nil {
			continue
		}
		out = append(out, f)
	}
	return out
}

// floatColumn extracts a numeric column as float64, skipping unparsable/empty cells.
func (t *Table) floatColumn(idx int) []float64 {
	var out []float64
	for _, row := range t.Rows {
		v := strings.TrimSpace(row[idx])
		if v == "" {
			continue
		}
		f, err := strconv.ParseFloat(v, 64)
		if err != nil {
			continue
		}
		out = append(out, f)
	}
	return out
}

func mean(xs []float64) float64 {
	if len(xs) == 0 {
		return math.NaN()
	}
	sum := 0.0
	for _, x := range xs {
		sum += x
	}
	return sum / float64(len(xs))
}

func stddev(xs []float64) float64 {
	if len(xs) < 2 {
		return 0
	}
	m := mean(xs)
	sum := 0.0
	for _, x := range xs {
		sum += (x - m) * (x - m)
	}
	return math.Sqrt(sum / float64(len(xs)-1))
}

func minMax(xs []float64) (float64, float64) {
	if len(xs) == 0 {
		return math.NaN(), math.NaN()
	}
	lo, hi := xs[0], xs[0]
	for _, x := range xs[1:] {
		if x < lo {
			lo = x
		}
		if x > hi {
			hi = x
		}
	}
	return lo, hi
}
