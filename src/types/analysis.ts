export interface ColumnStats {
  count: number;
  mean?: number;
  std?: number;
  min?: number;
  max?: number;
  unique?: number;
  top?: string;
  freq?: number;
}

export interface AnalysisSummary {
  shape: [number, number];
  columns: string[];
  summary: Record<string, ColumnStats>;
  missing: Record<string, number>;
  outliers: Record<string, number[]>;
}

export interface MLPrediction {
  value: number;
  target: string;
  kind: "time_series_forecast" | "classification_rate" | string;
  model: string;
  training_rows: number;
  horizon: string;
  validation_metric?: string;
  validation_score?: number;
  validation_normalised_mae?: number;
}

export interface MLReport {
  status: "trained" | "skipped" | "unavailable" | "error" | string;
  model_family: string;
  predictions: Record<string, MLPrediction>;
  message: string;
}

export interface AnalysisReport {
  summary: AnalysisSummary;
  kpis: Record<string, number>;
  ml: MLReport;
  type: "sales" | "hr" | "marketing" | "generic" | string;
  insights: string[];
  error?: string;
}
