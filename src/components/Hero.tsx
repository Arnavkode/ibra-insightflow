import { Button } from "@/components/ui/button";
import { GlassCard } from "./GlassCard";
import { BarChart3, TrendingUp, PieChart, Database, Users, Target, DollarSign, Calendar } from "lucide-react";

export const Hero = () => {
  const scrollToUpload = () => {
    document.getElementById('upload-section')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <>
      {/* Top gradient bar */}
      <div className="h-1 bg-gradient-topbar w-full"></div>
      
      <section className="min-h-screen bg-gradient-hero relative overflow-hidden">
        {/* Floating business icons */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-32 left-16 p-4 bg-accent/20 backdrop-blur-sm rounded-2xl rotate-12 animate-float">
            <BarChart3 className="w-8 h-8 text-primary" />
          </div>
          <div className="absolute top-48 right-24 p-3 bg-primary/20 backdrop-blur-sm rounded-xl -rotate-12 animate-float" style={{ animationDelay: '1s' }}>
            <TrendingUp className="w-6 h-6 text-accent" />
          </div>
          <div className="absolute bottom-64 left-32 p-5 bg-primary-glow/20 backdrop-blur-sm rounded-3xl rotate-45 animate-float" style={{ animationDelay: '2s' }}>
            <PieChart className="w-10 h-10 text-primary" />
          </div>
          <div className="absolute bottom-48 right-16 p-3.5 bg-accent-light/20 backdrop-blur-sm rounded-2xl -rotate-45 animate-float" style={{ animationDelay: '3s' }}>
            <Database className="w-7 h-7 text-accent" />
          </div>
          <div className="absolute top-96 left-1/4 p-2 bg-primary/20 backdrop-blur-sm rounded-full animate-float" style={{ animationDelay: '0.5s' }}>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="absolute top-80 right-1/3 p-2.5 bg-accent/20 backdrop-blur-sm rounded-xl animate-float" style={{ animationDelay: '1.5s' }}>
            <Target className="w-5 h-5 text-accent" />
          </div>
          <div className="absolute top-60 left-1/3 p-3 bg-primary-glow/20 backdrop-blur-sm rounded-2xl rotate-6 animate-float" style={{ animationDelay: '2.5s' }}>
            <DollarSign className="w-6 h-6 text-primary" />
          </div>
          <div className="absolute bottom-80 right-1/4 p-2.5 bg-accent/20 backdrop-blur-sm rounded-xl -rotate-6 animate-float" style={{ animationDelay: '4s' }}>
            <Calendar className="w-5 h-5 text-accent" />
          </div>
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
            <nav className="flex items-center gap-6">
              <a href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
              <Button variant="hero" size="lg">
                New Analysis
              </Button>
            </nav>
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
              <Button 
                variant="default" 
                size="xl" 
                className="text-lg px-8 py-4 shadow-glow"
                onClick={scrollToUpload}
              >
                Start Analyzing Now
              </Button>
              
            </div>
          </div>
        </div>
      </section>
    </>
  );
};