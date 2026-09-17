import { GlassCard } from "./GlassCard";
import { Button } from "@/components/ui/button";
import { BrainCircuit, DollarSign } from "lucide-react";
import type { AnalysisReport, AnalysisSummary, MLReport } from "@/types/analysis";

export const Dashboard = ({ reportData }: { reportData?: AnalysisReport | null }) => {
  // don't block rendering. show banner if no data, but still render UI.
  const hasData = !!(reportData && typeof reportData === 'object' && Object.keys(reportData).length > 0);

  const NoDataBanner = () => (
    <GlassCard variant="subtle" className="mb-6 p-4 bg-yellow-50 border-yellow-200 text-yellow-800">
      <strong>No analysis data:</strong> Upload a file to see real KPIs and insights computed from it.
    </GlassCard>
  );
  // Helper to handle NaN/null
  const safe = (val: unknown) => (val === null || val === undefined || String(val) === 'NaN' ? 'N/A' : String(val));
  const kpis = reportData?.kpis || {};
  const ml: MLReport = reportData?.ml || {
    status: "skipped",
    model_family: "none",
    predictions: {},
    message: "Upload a dataset to train KPI prediction models.",
  };
  const predictions = ml.predictions || {};
  const summary: AnalysisSummary = reportData?.summary ?? {
    shape: [0, 0],
    columns: [],
    summary: {},
    missing: {},
    outliers: {},
  };
  const type = safe(reportData?.type);
  const insights: string[] = Array.isArray(reportData?.insights) ? reportData.insights : [];

  const handleGmailExport = () => {
    let body = `Business Insights Report\n\n`;
    body += `Type: ${type}\n`;
    body += `Columns: ${(summary.columns || []).join(', ')}\n`;
    body += `KPIs:\n`;
    Object.entries(kpis).forEach(([k, v]) => {
      body += `- ${k.replace(/_/g, ' ')}: ${typeof v === 'number' ? v.toFixed(2) : v}\n`;
    });
    body += `\nML KPI Predictions (${ml.status}):\n`;
    Object.entries(predictions).forEach(([key, prediction]) => {
      body += `- ${key.replace(/_/g, ' ')}: ${prediction.value.toFixed(2)} (${prediction.model})\n`;
    });
    if (Object.keys(predictions).length === 0) body += `- ${ml.message}\n`;
    body += `\nTop Insights:\n`;
    insights.forEach((ins: string) => { body += `- ${ins}\n`; });
    const mailto = `mailto:?subject=Business Insights Report&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
  };

  // Download: ask backend to generate PDF (POST /api/generate-pdf) then download blob. Fallback to JSON download.
  const handleDownload = () => {
    const payload = reportData || { summary, kpis, type };
    fetch('http://localhost:5000/api/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(async res => {
      if (!res.ok) throw new Error('PDF generation failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'report.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    }).catch(err => {
      console.warn('PDF generation failed, falling back to JSON download', err);
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'report.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    });
  };
  return (
    <div className="space-y-8 animate-slide-up">
      {!hasData && <NoDataBanner />}
      <div className="flex justify-end gap-4">
        <Button variant="accent" size="lg" onClick={handleDownload}>
          Download PDF Report
        </Button>
        <Button variant="outline" size="lg" onClick={handleGmailExport}>
          Export to Gmail
        </Button>
      </div>
      <GlassCard variant="elevated" className="p-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(kpis).map(([key, value], idx) => (
            <div key={key} className="p-6 bg-glass/40 rounded-xl border border-glass-border hover:shadow-card transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-1 text-sm font-medium text-accent">
                  {typeof value === 'number' ? safe(value.toFixed(2)) : safe(String(value))}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground mb-1">{typeof value === 'number' ? safe(value.toFixed(2)) : safe(String(value))}</div>
                <div className="text-muted-foreground text-sm">{key.replace(/_/g, ' ')}</div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard variant="elevated" className="p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">ML KPI Predictions</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Model estimates trained from this upload, kept separate from calculated KPIs.
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
            ml.status === "trained"
              ? "bg-emerald-100 text-emerald-700"
              : ml.status === "error" || ml.status === "unavailable"
                ? "bg-red-100 text-red-700"
                : "bg-amber-100 text-amber-700"
          }`}>
            {ml.status}
          </span>
        </div>

        {Object.keys(predictions).length === 0 ? (
          <div className="rounded-xl border border-glass-border bg-muted/30 p-5 text-muted-foreground">
            {ml.message}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(predictions).map(([key, prediction]) => (
              <div key={key} className="p-6 bg-glass/40 rounded-xl border border-glass-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-accent/10 rounded-lg text-accent">
                    <BrainCircuit className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {prediction.model.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {safe(prediction.value?.toFixed(2))}
                </div>
                <div className="text-sm text-muted-foreground capitalize mt-1">
                  {key.replace(/_/g, " ")}
                </div>
                <div className="mt-4 pt-4 border-t border-glass-border text-xs text-muted-foreground space-y-1">
                  <div>{prediction.training_rows} training samples · {prediction.horizon.replace(/_/g, " ")}</div>
                  {prediction.validation_score !== undefined && (
                    <div>
                      Validation {prediction.validation_metric?.replace(/_/g, " ")}: {prediction.validation_score.toFixed(3)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <GlassCard variant="elevated" className="p-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Top Insights</h2>
        <div className="space-y-4">
          {insights.length === 0 && (
            <p className="text-muted-foreground">No insights available for this dataset yet.</p>
          )}
          {insights.slice(0, 3).map((insight, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-accent-light/20 rounded-xl border border-accent/20">
              <div className="flex-shrink-0 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                {index + 1}
              </div>
              <p className="text-foreground">{insight}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard variant="elevated" className="p-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Dataset Summary</h2>
        <div className="space-y-2">
          <div><strong>Type:</strong> {type}</div>
          <div><strong>Columns:</strong> {Array.isArray(summary.columns) ? summary.columns.map(safe).join(', ') : 'N/A'}</div>
          <div><strong>Shape:</strong> {Array.isArray(summary.shape) ? summary.shape.map(safe).join(' x ') : 'N/A'}</div>
        </div>
        <div className="mt-4">
          <strong>Missing Values:</strong>
          <ul className="list-disc ml-6">
            {summary.missing && Object.entries(summary.missing).map(([col, val]) => (
              <li key={col}>{safe(col)}: {safe(val)}</li>
            ))}
          </ul>
        </div>
      </GlassCard>
    </div>
  );
};
