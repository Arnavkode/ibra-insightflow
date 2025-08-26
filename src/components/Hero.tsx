import { Button } from "@/components/ui/button";
import { GlassCard } from "./GlassCard";

export const Hero = () => {
  return (
    <section className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-glow/30 rounded-full animate-float blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full animate-float blur-3xl" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-20">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center space-x-4">
            <div className="text-3xl font-bold text-white">IBRAE</div>
            <div className="hidden md:block text-white/80 text-sm font-medium">
              Intelligent Business Reporting & Analytics Engine
            </div>
          </div>
          <Button variant="hero" size="lg" className="animate-pulse-glow">
            New Analysis
          </Button>
        </header>

        {/* Main Hero Content */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-slide-up">
            One-click KPI dashboards
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            with context-aware insights
          </p>
          <div className="flex justify-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Button variant="hero" size="xl" className="text-lg px-8 py-4">
              Start Analyzing
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};