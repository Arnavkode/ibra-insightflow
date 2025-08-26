import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Github, Linkedin, Mail, Code } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-glow/30 rounded-full animate-float blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full animate-float blur-3xl" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Back Button */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="hero" className="mb-4">
              <ArrowLeft size={16} />
              Back to IBRAE
            </Button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <GlassCard variant="elevated" className="p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Image */}
              <div className="text-center lg:text-left">
                <div className="w-48 h-48 mx-auto lg:mx-0 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 shadow-glow">
                  <img src = "public\bhavya.png"></img>
                </div>
                
                {/* Social Links */}
                <div className="flex justify-center lg:justify-start gap-4">
                  <Button variant="outline" size="icon" className="hover:text-primary">
                    <Github size={20} />
                  </Button>
                  <Button variant="outline" size="icon" className="hover:text-primary">
                    <Linkedin size={20} />
                  </Button>
                  <Button variant="outline" size="icon" className="hover:text-primary">
                    <Mail size={20} />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-2">Bhavya Arora</h1>
                  <p className="text-xl text-primary font-semibold">Electrical Engineering, Data analytics enthusiast</p>
                </div>

                <div className="space-y-4 text-muted-foreground">
                  <p className="text-lg leading-relaxed">
                    Hi! I'm passionate about transforming complex data into actionable business insights. 
                    IBRAE represents my vision of making advanced analytics accessible to everyone, 
                    regardless of their technical background.
                  </p>

                  <p className="leading-relaxed">
                    With years of experience in building scalable web applications and working with 
                    enterprise data systems, I understand the pain points businesses face when trying 
                    to extract meaningful insights from their data. That's why I created IBRAE - 
                    to bridge the gap between raw data and strategic decision-making.
                  </p>

                  <p className="leading-relaxed">
                    The platform combines cutting-edge AI with intuitive design to deliver what 
                    traditional business intelligence tools promise but often fail to achieve: 
                    true one-click insights that actually drive business value.
                  </p>
                </div>

                {/* Skills/Technologies */}
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">Technologies & Expertise</h2>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "React", "TypeScript", "Python", "SQL", "PostgreSQL", 
                      "Machine Learning", "Data Visualization", "API Design", 
                      "Cloud Architecture", "Business Intelligence"
                    ].map((tech) => (
                      <span 
                        key={tech}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mission Statement */}
                <div className="p-6 bg-accent/10 rounded-xl border border-accent/20">
                  <h2 className="text-lg font-semibold text-foreground mb-2">Mission</h2>
                  <p className="text-muted-foreground italic">
                    "To democratize data analytics and empower businesses of all sizes to make 
                    data-driven decisions without the complexity of traditional BI tools."
                  </p>
                </div>

                {/* Contact CTA */}
                <div className="pt-4">
                  <Button variant="default" size="lg" className="w-full md:w-auto">
                    <Mail className="mr-2" size={16} />
                    Get in Touch
                  </Button>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <GlassCard variant="subtle" className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Why IBRAE?</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>• 80% faster than traditional reporting</li>
                <li>• Context-aware insights, not just charts</li>
                <li>• Enterprise-grade security & privacy</li>
                <li>• No complex setup or training required</li>
              </ul>
            </GlassCard>

            <GlassCard variant="subtle" className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Future Roadmap</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>• Real-time dashboard updates</li>
                <li>• Advanced ML-powered predictions</li>
                <li>• Custom visualization builder</li>
                <li>• Team collaboration features</li>
              </ul>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}