import { GlassCard } from "./GlassCard";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";

export const Dashboard = ({ reportData }: { reportData?: any }) => {
  // don't block rendering. show banner if no data, but still render UI.
  const hasData = !!(reportData && typeof reportData === 'object' && Object.keys(reportData).length > 0);

  const NoDataBanner = () => (
    <GlassCard variant="subtle" className="mb-6 p-4 bg-yellow-50 border-yellow-200 text-yellow-800">
      <strong>No analysis data:</strong> Upload a file to see real KPIs and insights computed from it.
    </GlassCard>
  );
  // Helper to handle NaN/null
  const safe = (val: any) => (val === null || val === undefined || String(val) === 'NaN' ? 'N/A' : val);
  const kpis = reportData?.kpis || {};
  const summary = reportData?.summary || {};
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
