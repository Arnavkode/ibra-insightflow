import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/Hero";
import { UploadSection } from "@/components/UploadSection";
import { Dashboard } from "@/components/Dashboard";
import { ReportActions } from "@/components/ReportActions";
import { GlassCard } from "@/components/GlassCard";
import { Link } from "react-router-dom";
import { User, BarChart3, Zap, Share2, Mail } from "lucide-react";
import type { AnalysisReport } from "@/types/analysis";

const Index = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [reportData, setReportData] = useState<AnalysisReport | null>(null);
  // Show dashboard after analysis/upload
  const handleShowDashboard = (data?: AnalysisReport) => {
    // Accept any object with 'summary' and 'kpis' keys as valid
    if (
      data &&
      typeof data === 'object' &&
      data.summary && typeof data.summary === 'object' &&
      data.kpis && typeof data.kpis === 'object'
    ) {
      console.log('[Frontend] Dashboard received VALID reportData:', data);
      setReportData(data);
      setShowDashboard(true);
    } else {
      console.warn('[Frontend] Dashboard received INVALID or empty reportData:', data);
      setReportData(null);
      setShowDashboard(true); // Still show dashboard for error state
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Main Content */}
      <div className="relative bg-background">
        <div className="container mx-auto px-6 py-20 space-y-16">
          
          {/* Upload Section */}
          <section id="upload-section">
            <UploadSection
              onAnalyze={(data) => {
                // Log and validate incoming data from backend
                console.log('[Frontend] UploadSection onAnalyze received:', data);
                handleShowDashboard(data);
              }}
            />
          </section>

          {/* Dashboard shown after analysis/upload */}
          {showDashboard && (
            <section className="animate-slide-up">
              <Dashboard reportData={reportData} />
            </section>
          )}

          {/* Report Actions - Show when dashboard is visible */}
          {showDashboard && (
            <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <ReportActions reportData={reportData} />
            </section>
          )}

          {/* Footer */}
          <footer className="pt-16">
            <GlassCard variant="subtle" className="p-8 text-center">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Intelligent Business Reporting & Analytics Engine
                </h2>
                <div className="mb-8 text-lg text-muted-foreground">
                  Built an automated data-to-report pipeline with context-aware insights, enabling one-click KPI dashboard and top three action items, improving reporting efficiency by 80%.
                </div>
                <div className="text-left text-muted-foreground mb-8">
                  <strong>Project Idea: Smart Business Insights Generator</strong><br />
                  <ol className="list-decimal ml-6">
                    <li>Upload File (Excel, CSV, or Google Sheet link)</li>
                    <li>Auto Data Cleaning: Remove duplicates, handle missing values, standardize date formats</li>
                    <li>Automated Exploratory Analysis: Summary statistics, outlier detection</li>
                    <li>KPI Analysis: Calculate actual metrics, then train ML models for eligible forecasts and risk rates</li>
                    <li>Visualization & Dashboard: Auto-generate graphs (sales trends, customer segments, region performance, etc.)</li>
                    <li>Export Final Report: Professional PDF with charts + summary, optionally PowerPoint deck</li>
                  </ol>
                  <ul className="list-disc ml-6 mt-4">
                    <li>Business Context Auto-Detection: Script detects dataset type and tailors KPIs</li>
                    <li>One-Click Report: Raw data → consulting-level report</li>
                    <li>Custom Insights: Highlights top 3 actionable insights</li>
                    <li>Email Integration (optional): Automatically sends report to stakeholders</li>
                  </ul>
                  <div className="mt-4">
                    <strong>Tech Stack:</strong> Go API, Python (pandas, scikit-learn, XGBoost), React, and TypeScript<br />
                    <strong>Example Output (PDF Report):</strong> Executive Summary, Key Metrics Table, Graphs, Insights & Recommendations
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-glass-border text-sm text-muted-foreground">
                  <p>© 2025 Intelligent Business Reporting & Analytics Engine</p>
                  <p className="mt-2">Built with passion for data-driven businesses</p>
                </div>
              </div>
            </GlassCard>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Index;
