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

export const Dashboard = () => {
  return (
    <div className="space-y-8 animate-slide-up">
      {/* KPI Grid */}
      <GlassCard variant="elevated" className="p-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockKPIs.map((kpi, index) => (
            <div key={index} className="p-6 bg-glass/40 rounded-xl border border-glass-border hover:shadow-card transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {kpi.icon}
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  kpi.trend === 'up' ? 'text-accent' : 'text-destructive'
                }`}>
                  {kpi.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {kpi.change}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground mb-1">{kpi.value}</div>
                <div className="text-muted-foreground text-sm">{kpi.title}</div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Insights */}
      <GlassCard variant="elevated" className="p-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Top 3 Action Items</h2>
        <div className="space-y-4">
          {mockInsights.map((insight, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-accent-light/20 rounded-xl border border-accent/20">
              <div className="flex-shrink-0 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                {index + 1}
              </div>
              <p className="text-foreground">{insight}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Charts Gallery */}
      <GlassCard variant="elevated" className="p-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Visual Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mockCharts.map((chart, index) => (
            <div key={index} className="p-6 bg-glass/40 rounded-xl border border-glass-border">
              <h3 className="font-semibold text-foreground mb-4">{chart.title}</h3>
              <img 
                src={chart.image_base64} 
                alt={chart.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Meta Information */}
      <GlassCard variant="subtle" className="p-6">
        <div className="flex flex-wrap items-center gap-4">
          <Badge variant="outline" className="bg-glass/60">
            Dataset: E-commerce Analytics
          </Badge>
          <Badge variant="outline" className="bg-glass/60">
            Processing: 2,847ms
          </Badge>
          <Badge variant="outline" className="bg-glass/60 flex items-center gap-2">
            Report ID: RPT-2024-001
            <Copy size={14} className="cursor-pointer hover:text-primary" />
          </Badge>
        </div>
      </GlassCard>
    </div>
  );
};