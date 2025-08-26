import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "subtle";
}

export const GlassCard = ({ children, className, variant = "default" }: GlassCardProps) => {
  const variants = {
    default: "bg-glass/80 backdrop-blur-glass border border-glass-border shadow-glass",
    elevated: "bg-gradient-glass backdrop-blur-glass border border-glass-border shadow-card hover:shadow-glow transition-all duration-300",
    subtle: "bg-glass/60 backdrop-blur-glass border border-glass-border/50 shadow-card"
  };

  return (
    <div 
      className={cn(
        "rounded-2xl transition-all duration-300 animate-glass-morph",
        variants[variant],
        className
      )}
    >
      {children}
    </div>
  );
};