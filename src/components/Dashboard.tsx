import { GlassCard } from "./GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Activity, Copy, ExternalLink } from "lucide-react";

interface KPI {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
}

const mockKPIs: KPI[] = [
  {
    title: "Total Revenue",
    value: "$127,543",
    change: "+12.5%",
    trend: "up",
    icon: <DollarSign className="h-6 w-6" />
  },
  {
    title: "Active Users",
    value: "8,924",
    change: "+8.2%",
    trend: "up",
    icon: <Users className="h-6 w-6" />
  },
  {
    title: "Conversion Rate",
    value: "3.24%",
    change: "-2.1%",
    trend: "down",
    icon: <Activity className="h-6 w-6" />
  },
  {
    title: "Total Orders",
    value: "1,547",
    change: "+18.7%",
    trend: "up",
    icon: <ShoppingCart className="h-6 w-6" />
  }
];

const mockInsights = [
  "Revenue peaked during Q3 with highest customer acquisition in July (+32%)",
  "Mobile traffic converted 15% better than desktop, suggesting mobile optimization success",
  "Customer retention improved by 24% after implementing the new onboarding flow"
];

const mockCharts = [
  {
    title: "Revenue Trend Analysis",
    image_base64: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjhGQUZDIiByeD0iOCIvPgo8cGF0aCBkPSJNNTAgMTUwTDEwMCAxMjBMMTUwIDEwMEwyMDAgODBMMjUwIDYwTDMwMCA0MEwzNTAgMjAiIHN0cm9rZT0iIzY2NjZGRiIgc3Ryb2tlLXdpZHRoPSIzIiBmaWxsPSJub25lIi8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMTUwIiByPSI0IiBmaWxsPSIjNjY2NkZGIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEyMCIgcj0iNCIgZmlsbD0iIzY2NjZGRiIvPgo8Y2lyY2xlIGN4PSIxNTAiIGN5PSIxMDAiIHI9IjQiIGZpbGw9IiM2NjY2RkYiLz4KPGJ0ZXh0IHg9IjIwIiB5PSIxODAiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWkiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM2NjY2NjYiPkphbiA8L3RleHQ+Cjx0ZXh0IHg9IjcwIiB5PSIxODAiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWkiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM2NjY2NjYiPkZlYiA8L3RleHQ+Cjx0ZXh0IHg9IjEyMCIgeT0iMTgwIiBmb250LWZhbWlseT0ic3lzdGVtLXVpIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNjY2NjY2Ij5NYXIgPC90ZXh0Pgo8L3N2Zz4="
  },
  {
    title: "User Acquisition Channels",
    image_base64: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjhGQUZDIiByeD0iOCIvPgo8Y2lyY2xlIGN4PSIyMDAiIGN5PSIxMDAiIHI9IjgwIiBmaWxsPSJub25lIiBzdHJva2U9IiNFMkU4RjAiIHN0cm9rZS13aWR0aD0iMjAiLz4KPGF0aCBkPSJNIDIwMCAyMCBBIDgwIDgwIDAgMCAxIDM1NSAxMDAgTCAyMDAgMTAwIFoiIGZpbGw9IiM2NjY2RkYiLz4KPGF0aCBkPSJNIDM1NSAxMDAgQSA4MCA4MFpaIDAgMCAxIDIwMCAxODAgTCAyMDAgMTAwIFoiIGZpbGw9IiMyRkQ5Q0EiLz4KPGF0aCBkPSJNIDIwMCAxODAgQSA4MCA4MFegZCAwIDAgMSA0NSAxMDAgTCAyMDAgMTAwIFoiIGZpbGw9IiNGRjYyNjIiLz4KPGF0aCBkPSJNIDQ1IDEwMCBBIDgwIDgwCDA9PSAwIDAgMSAyMDAgMjAgTCAyMDAgMTAwIFoiIGZpbGw9IiNGQkJGMjQiLz4KPC9zdmc+"
  }
];

export const Dashboard = ({ reportData }: { reportData?: any }) => {
  if (!reportData || typeof reportData !== 'object' || Object.keys(reportData).length === 0) {
    return (
      <GlassCard variant="elevated" className="p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-6">No Analysis Data</h2>
        <p className="text-muted-foreground">No valid report data was received. Please upload a valid file and try again.</p>
      </GlassCard>
    );
  }
  // Gmail export
  const handleGmailExport = () => {
    if (!reportData) return;
    const kpis = reportData.kpis || {};
    const summary = reportData.summary || {};
    let body = `Business Insights Report\n\n`;
    body += `Type: ${reportData.type || ''}\n`;
    body += `Columns: ${(summary.columns || []).join(', ')}\n`;
    body += `KPIs:\n`;
    Object.entries(kpis).forEach(([k, v]) => {
      body += `- ${k.replace(/_/g, ' ')}: ${typeof v === 'number' ? v.toFixed(2) : v}\n`;
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
    window.open(mailto, '_blank');
  };
  const handleDownload = () => {
    window.open('http://localhost:5000/api/download', '_blank');
  };
  // Helper to handle NaN/null
  const safe = (val: any) => (val === null || val === undefined || String(val) === 'NaN' ? 'N/A' : val);
  const kpis = reportData?.kpis || {};
  const summary = reportData?.summary || {};
  const type = safe(reportData?.type);
  // Example insights logic
  const insights = [
    ...(kpis.revenue_growth !== undefined ? [`Revenue growth: ${safe((kpis.revenue_growth * 100).toFixed(2))}%`] : []),
    ...(kpis.profit_margin !== undefined ? [`Profit margin: ${safe((kpis.profit_margin * 100).toFixed(2))}%`] : []),
    ...(kpis.churn_rate !== undefined ? [`Churn rate: ${safe((kpis.churn_rate * 100).toFixed(2))}%`] : []),
    ...(kpis.conversion_rate !== undefined ? [`Conversion rate: ${safe((kpis.conversion_rate * 100).toFixed(2))}%`] : []),
    ...(Object.keys(kpis).length === 0 ? ['No KPIs detected for this dataset.'] : [])
  ];
  return (
    <div className="space-y-8 animate-slide-up">
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
                  {/* Icon logic can be improved */}
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