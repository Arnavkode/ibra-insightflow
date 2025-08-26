import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/Hero";
import { UploadSection } from "@/components/UploadSection";
import { Dashboard } from "@/components/Dashboard";
import { ReportActions } from "@/components/ReportActions";
import { GlassCard } from "@/components/GlassCard";
import { Link } from "react-router-dom";
import { User, BarChart3, Zap, Share2, Mail } from "lucide-react";

const Index = () => {
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Main Content */}
      <div className="relative bg-background">
        <div className="container mx-auto px-6 py-20 space-y-16">
          
          {/* Upload Section */}
          <section id="upload-section">
            <UploadSection />
          </section>

          {/* Dashboard Section - Mock shown for demo */}
          <section className="space-y-8">
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => setShowDashboard(!showDashboard)}
                className="mb-8"
              >
                <BarChart3 className="mr-2" size={16} />
                {showDashboard ? 'Hide' : 'Show'} Sample Dashboard
              </Button>
            </div>

            {showDashboard && (
              <div className="animate-slide-up">
                <Dashboard />
              </div>
            )}
          </section>

          {/* Report Actions - Show when dashboard is visible */}
          {showDashboard && (
            <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <ReportActions />
            </section>
          )}

          {/* Footer */}
          <footer className="pt-16">
            <GlassCard variant="subtle" className="p-8 text-center">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  The Future of Business Intelligence
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Automated data-to-report pipeline</span>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-3 bg-accent/10 rounded-full">
                      <BarChart3 className="h-6 w-6 text-accent" />
                    </div>
                    <span className="text-sm font-medium">Context-aware insights</span>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Share2 className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium">One-click dashboards</span>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-3 bg-accent/10 rounded-full">
                      <Mail className="h-6 w-6 text-accent" />
                    </div>
                    <span className="text-sm font-medium">Email & share reports</span>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6">
                  Transform your business data into strategic advantages with IBRAE's 
                  intelligent reporting engine. Experience the power of AI-driven analytics 
                  that understands your business context.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="default" size="lg">
                    Start Free Trial
                  </Button>
                  <Button variant="outline" size="lg">
                    Schedule Demo
                  </Button>
                </div>

                <div className="mt-8 pt-8 border-t border-glass-border text-sm text-muted-foreground">
                  <p>© 2024 IBRAE - Intelligent Business Reporting & Analytics Engine</p>
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