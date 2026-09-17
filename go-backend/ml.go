package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"
)

type MLPrediction struct {
	Value                   float64  `json:"value"`
	Target                  string   `json:"target"`
	Kind                    string   `json:"kind"`
	Model                   string   `json:"model"`
	TrainingRows            int      `json:"training_rows"`
	Horizon                 string   `json:"horizon"`
	ValidationMetric        string   `json:"validation_metric,omitempty"`
	ValidationScore         *float64 `json:"validation_score,omitempty"`
	ValidationNormalisedMAE *float64 `json:"validation_normalised_mae,omitempty"`
}

type MLReport struct {
	Status      string                  `json:"status"`
	ModelFamily string                  `json:"model_family"`
	Predictions map[string]MLPrediction `json:"predictions"`
	Message     string                  `json:"message"`
}

type mlRequest struct {
	Columns     []string   `json:"columns"`
	Rows        [][]string `json:"rows"`
	DatasetType string     `json:"dataset_type"`
}

func emptyMLReport(status, message string) MLReport {
	return MLReport{
		Status:      status,
		ModelFamily: "none",
		Predictions: map[string]MLPrediction{},
		Message:     message,
	}
}

// runMLAnalysis delegates training to the Python model process. ML failures
// are non-fatal: descriptive analysis remains available and the response says
// exactly why predictions could not be generated.
func runMLAnalysis(t *Table, dtype string) MLReport {
	python, prefixArgs, err := findPython()
	if err != nil {
		return emptyMLReport("unavailable", err.Error())
	}
	script, err := findMLScript()
	if err != nil {
		return emptyMLReport("unavailable", err.Error())
	}

	payload, err := json.Marshal(mlRequest{Columns: t.Columns, Rows: t.Rows, DatasetType: dtype})
	if err != nil {
		return emptyMLReport("error", "could not prepare ML input: "+err.Error())
	}

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()
	args := append(prefixArgs, script)
	cmd := exec.CommandContext(ctx, python, args...)
	cmd.Stdin = bytes.NewReader(payload)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		if ctx.Err() == context.DeadlineExceeded {
			return emptyMLReport("error", "ML training exceeded the 60 second limit")
		}
		detail := strings.TrimSpace(stderr.String())
		if detail == "" {
			detail = err.Error()
		}
		return emptyMLReport("error", "ML process failed: "+detail)
	}

	var report MLReport
	if err := json.Unmarshal(stdout.Bytes(), &report); err != nil {
		return emptyMLReport("error", "ML process returned invalid output: "+err.Error())
	}
	if report.Predictions == nil {
		report.Predictions = map[string]MLPrediction{}
	}
	return report
}

func findPython() (string, []string, error) {
	if configured := strings.TrimSpace(os.Getenv("IBRAE_PYTHON")); configured != "" {
		return configured, nil, nil
	}
	for _, name := range []string{"python", "python3"} {
		if path, err := exec.LookPath(name); err == nil {
			return path, nil, nil
		}
	}
	if runtime.GOOS == "windows" {
		if path, err := exec.LookPath("py"); err == nil {
			return path, []string{"-3"}, nil
		}
	}
	return "", nil, fmt.Errorf("Python 3 was not found; install the ML requirements and set IBRAE_PYTHON if needed")
}

func findMLScript() (string, error) {
	if configured := strings.TrimSpace(os.Getenv("IBRAE_ML_SCRIPT")); configured != "" {
		if _, err := os.Stat(configured); err == nil {
			return configured, nil
		}
		return "", fmt.Errorf("IBRAE_ML_SCRIPT does not point to a readable file")
	}
	candidates := []string{"ml_engine.py", filepath.Join("go-backend", "ml_engine.py")}
	if _, sourceFile, _, ok := runtime.Caller(0); ok {
		candidates = append(candidates, filepath.Join(filepath.Dir(sourceFile), "ml_engine.py"))
	}
	for _, candidate := range candidates {
		if path, err := filepath.Abs(candidate); err == nil {
			if _, statErr := os.Stat(path); statErr == nil {
				return path, nil
			}
		}
	}
	return "", fmt.Errorf("ml_engine.py was not found; set IBRAE_ML_SCRIPT to its path")
}
