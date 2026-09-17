package main

import "strings"

// cleanTable removes exact-duplicate rows and forward/backward-fills empty
// cells per column, mirroring the intent of the original pandas
// drop_duplicates + ffill/bfill pipeline.
func cleanTable(t *Table) *Table {
	deduped := dropDuplicates(t)
	fillMissing(deduped)
	return deduped
}

func dropDuplicates(t *Table) *Table {
	seen := make(map[string]bool, len(t.Rows))
	out := &Table{Columns: t.Columns}
	for _, row := range t.Rows {
		key := strings.Join(row, "\x1f")
		if seen[key] {
			continue
		}
		seen[key] = true
		out.Rows = append(out.Rows, row)
	}
	return out
}

func fillMissing(t *Table) {
	for col := range t.Columns {
		last := ""
		haveLast := false
		for _, row := range t.Rows {
			if isEmpty(row[col]) {
				if haveLast {
					row[col] = last
				}
			} else {
				last = row[col]
				haveLast = true
			}
		}
		next := ""
		haveNext := false
		for i := len(t.Rows) - 1; i >= 0; i-- {
			row := t.Rows[i]
			if isEmpty(row[col]) {
				if haveNext {
					row[col] = next
				}
			} else {
				next = row[col]
				haveNext = true
			}
		}
	}
}
