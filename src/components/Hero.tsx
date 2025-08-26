import { Button } from "@/components/ui/button";
import { GlassCard } from "./GlassCard";

export const Hero = () => {
  return (
    <>
      {/* Top gradient bar */}
      <div className="h-1 bg-gradient-topbar w-full"></div>
      
      <section className="min-h-screen bg-gradient-hero relative overflow-hidden">
        {/* Floating decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-32 left-16 w-16 h-16 bg-accent/80 rounded-2xl rotate-12 animate-float"></div>
          <div className="absolute top-48 right-24 w-12 h-12 bg-primary/70 rounded-xl -rotate-12 animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-64 left-32 w-20 h-20 bg-primary-glow/60 rounded-3xl rotate-45 animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-48 right-16 w-14 h-14 bg-accent-light/50 rounded-2xl -rotate-45 animate-float" style={{ animationDelay: '3s' }}></div>
          <div className="absolute top-96 left-1/4 w-8 h-8 bg-primary/60 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-80 right-1/3 w-10 h-10 bg-accent/40 rounded-xl animate-float" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 pt-8">
          {/* Header */}
          <header className="flex justify-between items-center mb-20">
            <div className="flex items-center space-x-6">
              <div className="text-4xl font-bold text-foreground">IBRAE</div>
              <div className="hidden md:block text-muted-foreground text-sm font-medium">
                Business Reports • Contributors • Analytics
              </div>
            </div>
            <Button variant="hero" size="lg">
              New Analysis
            </Button>
          </header>

          {/* Main Hero Content */}
          <div className="text-center mb-24 max-w-5xl mx-auto">
            <h1 className="text-6xl md:text-8xl font-bold text-foreground mb-8 leading-tight">
              Your Business Intelligence,{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Empowered by AI
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Generate comprehensive KPI dashboards with context-aware insights through cutting-edge AI analysis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button variant="default" size="xl" className="text-lg px-8 py-4 shadow-glow">
                Start Analyzing Now
              </Button>
              <Button variant="outline" size="xl" className="text-lg px-8 py-4">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};