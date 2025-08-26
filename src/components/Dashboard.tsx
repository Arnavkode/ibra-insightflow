import React from "react";
// Stylized glass card component
function GlassCard({ children, className = "" }) {
  return (
    <div className={`rounded-2xl bg-white/60 backdrop-blur border border-glass-border shadow-lg p-8 ${className}`}>
      {children}
    </div>
  );
}

export function Dashboard({ reportData }: { reportData?: any }) {
  // Debug: log incoming prop to help trace why dashboard shows empty
  console.log('[Dashboard] raw reportData prop:', reportData, 'type:', typeof reportData);

  // Accept JSON string or object. Normalize to `data` object.
  let data: any = reportData;
  if (typeof reportData === 'string') {
    try {
      data = JSON.parse(reportData);
      console.log('[Dashboard] parsed reportData from JSON string:', data);
    } catch (e) {
      console.warn('[Dashboard] failed to parse reportData string as JSON', e);
    }
  }

  if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <GlassCard className="w-full max-w-4xl text-center bg-gray-300/80">
          <h2 className="text-2xl font-bold text-foreground mb-4">No Analysis Data</h2>
          <p className="text-muted-foreground">No valid report data was received. Please upload a valid file and try again.</p>
        </GlassCard>
      </div>
    );
  }

  // Helper to handle NaN/null
  const safe = (val: any) =>
    val === null || val === undefined || String(val) === "NaN" ? "N/A" : val;
  const kpis = data.kpis || {};
  const summary = data.summary || {};
  const type = safe(data.type);

  // Insights logic
  const insights = [
    ...(kpis.revenue_growth !== undefined
      ? [`Revenue growth: ${safe((kpis.revenue_growth * 100).toFixed(2))}%`]
      : []),
    ...(kpis.profit_margin !== undefined
      ? [`Profit margin: ${safe((kpis.profit_margin * 100).toFixed(2))}%`]
      : []),
    ...(kpis.churn_rate !== undefined
      ? [`Churn rate: ${safe((kpis.churn_rate * 100).toFixed(2))}%`]
      : []),
    ...(kpis.conversion_rate !== undefined
      ? [`Conversion rate: ${safe((kpis.conversion_rate * 100).toFixed(2))}%`]
      : []),
    ...(Object.keys(kpis).length === 0 ? ["No KPIs detected for this dataset."] : []),
  ];

  // Gmail export
  const handleGmailExport = () => {
    let body = `Business Insights Report\n\n`;
    body += `Type: ${reportData.type || ""}\n`;
    body += `Columns: ${(summary.columns || []).join(", ")}\n`;
    body += `KPIs:\n`;
    Object.entries(kpis).forEach(([k, v]) => {
      body += `- ${k.replace(/_/g, " ")}: ${typeof v === "number" ? v.toFixed(2) : v}\n`;
    });
    body += `\nSummary:\n`;
    if (summary.summary) {
      Object.entries(summary.summary).forEach(([col, stats]) => {
        body += `${col}: `;
        Object.entries(stats as any).forEach(([stat, val]) => {
          body += `${stat}: ${val}, `;
        });
        body += `\n`;
      });
    }
    const mailto = `mailto:?subject=Business Insights Report&body=${encodeURIComponent(body)}`;
    window.open(mailto, "_blank");
  };

  // PDF download
  const handleDownload = () => {
    window.open("http://localhost:5000/api/download", "_blank");
  };

  return (
    <div className="space-y-8 animate-slide-up max-w-6xl mx-auto">
      <div className="flex justify-end gap-4">
        <button className="px-4 py-2 rounded-lg bg-blue-600 text-white shadow hover:bg-blue-700 transition" onClick={handleDownload}>
          Download PDF Report
        </button>
        <button className="px-4 py-2 rounded-lg border border-blue-600 text-blue-600 shadow hover:bg-blue-50 transition" onClick={handleGmailExport}>
          Export to Gmail
        </button>
      </div>

      <GlassCard>
        <h2 className="text-2xl font-bold text-foreground mb-6">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(kpis).map(([key, value]) => (
            <div key={key} className="p-6 bg-white/60 rounded-xl border border-glass-border hover:shadow-card transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {/* Add icon if desired */}
                </div>
                <div className="flex items-center gap-1 text-sm font-medium text-accent">
                  {typeof value === "number" ? safe(value.toFixed(2)) : safe(String(value))}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground mb-1">{typeof value === "number" ? safe(value.toFixed(2)) : safe(String(value))}</div>
                <div className="text-muted-foreground text-sm">{key.replace(/_/g, " ")}</div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <h2 className="text-2xl font-bold text-foreground mb-6">Top 3 Action Items</h2>
        <div className="space-y-4">
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

      <GlassCard>
        <h2 className="text-2xl font-bold text-foreground mb-6">Dataset Summary</h2>
        <div className="space-y-2">
          <div><strong>Type:</strong> {type}</div>
          <div><strong>Columns:</strong> {Array.isArray(summary.columns) ? summary.columns.map(safe).join(", ") : "N/A"}</div>
          <div><strong>Shape:</strong> {Array.isArray(summary.shape) ? summary.shape.map(safe).join(" x ") : "N/A"}</div>
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
}