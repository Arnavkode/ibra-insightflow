package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/upload", withCORS(handleUpload))
	mux.HandleFunc("/api/generate-pdf", withCORS(handleGeneratePDF))
	mux.HandleFunc("/api/download", withCORS(handleDownload))

	log.Println("Backend running on port 5000")
	log.Fatal(http.ListenAndServe(":5000", mux))
}

func withCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next(w, r)
	}
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

func handleUpload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "POST required")
		return
	}

	if err := r.ParseMultipartForm(10 << 20); err != nil {
		writeError(w, http.StatusBadRequest, "invalid upload: "+err.Error())
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil {
		writeError(w, http.StatusBadRequest, "no file provided")
		return
	}
	defer file.Close()

	if err := os.MkdirAll("uploads", 0o755); err != nil {
		writeError(w, http.StatusInternalServerError, "server storage error")
		return
	}
	dest := filepath.Join("uploads", time.Now().Format("20060102-150405")+"-"+filepath.Base(header.Filename))
	out, err := os.Create(dest)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "server storage error")
		return
	}
	if _, err := io.Copy(out, file); err != nil {
		out.Close()
		writeError(w, http.StatusInternalServerError, "failed to store upload")
		return
	}
	out.Close()

	log.Printf("[UPLOAD] received %s -> %s", header.Filename, dest)

	result := analyzeFile(dest)
	if result.Error != "" {
		writeJSON(w, http.StatusUnprocessableEntity, result)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func analyzeFile(path string) AnalysisResult {
	raw, err := loadTable(path)
	if err != nil {
		return AnalysisResult{Error: err.Error()}
	}
	if len(raw.Columns) == 0 {
		return AnalysisResult{Error: "file read error: no columns found"}
	}

	cleaned := cleanTable(raw)
	summary := computeSummary(raw, cleaned)
	dtype := detectType(cleaned.Columns)
	kpis := computeKPIs(cleaned, dtype)
	mlReport := runMLAnalysis(cleaned, dtype)
	insights := generateInsights(cleaned, summary)
	insights = appendMLInsights(insights, mlReport)

	return AnalysisResult{
		Summary:  summary,
		KPIs:     kpis,
		ML:       mlReport,
		Type:     dtype,
		Insights: insights,
	}
}

func handleGeneratePDF(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "POST required")
		return
	}
	var payload ReportPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, "invalid report payload")
		return
	}
	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", "attachment; filename=report.pdf")
	if err := writePDF(w, payload); err != nil {
		log.Println("[PDF] generation error:", err)
	}
}

func handleDownload(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "report.pdf")
}
