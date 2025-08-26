import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GlassCard } from "./GlassCard";
import { Download, FileText, Presentation, Share2, Mail, Clock, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ReportActions = () => {
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("IBRAE Analytics Report");
  const [baselineMinutes, setBaselineMinutes] = useState(120);
  const { toast } = useToast();

  const processingMs = 2847;
  const efficiency = Math.round(((baselineMinutes * 60 * 1000 - processingMs) / (baselineMinutes * 60 * 1000)) * 100);

  const handleDownload = (type: "pdf" | "pptx") => {
    toast({
      title: `${type.toUpperCase()} Downloaded`,
      description: `Your ${type === "pdf" ? "PDF report" : "PowerPoint presentation"} has been downloaded successfully.`,
    });
  };

  const handleCopyLinks = () => {
    const links = [
      "https://ibrae.app/reports/RPT-2024-001",
      "https://ibrae.app/reports/RPT-2024-001/pdf",
      "https://ibrae.app/reports/RPT-2024-001/pptx"
    ];
    
    navigator.clipboard.writeText(links.join('\n'));
    toast({
      title: "Links Copied",
      description: "Share links have been copied to your clipboard.",
    });
  };

  const handleEmailReport = () => {
    if (!emailTo) {
      toast({
        title: "Email Required",
        description: "Please enter an email address.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Report Sent",
      description: `Report successfully sent to ${emailTo}`,
    });
    setEmailTo("");
  };

  return (
    <div className="space-y-6">
      {/* Download Actions */}
      <GlassCard variant="elevated" className="p-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Export & Share</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-2"
            onClick={() => handleDownload("pdf")}
          >
            <FileText size={20} />
            Download PDF
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-2"
            onClick={() => handleDownload("pptx")}
          >
            <Presentation size={20} />
            Download PPTX
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-2"
            onClick={handleCopyLinks}
          >
            <Share2 size={20} />
            Copy Share Links
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="accent" className="h-16 flex-col gap-2">
                <Mail size={20} />
                Email Report
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Email Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">To</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="recipient@company.com"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                  />
                </div>
                <Button onClick={handleEmailReport} className="w-full">
                  Send Report
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Share Links */}
        <div className="p-4 bg-muted/30 rounded-xl">
          <h3 className="font-semibold text-foreground mb-3">Share Links</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="w-16">Report:</span>
              <code className="flex-1 p-1 bg-glass rounded text-xs">https://ibrae.app/reports/RPT-2024-001</code>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="w-16">PDF:</span>
              <code className="flex-1 p-1 bg-glass rounded text-xs">https://ibrae.app/reports/RPT-2024-001/pdf</code>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="w-16">PPTX:</span>
              <code className="flex-1 p-1 bg-glass rounded text-xs">https://ibrae.app/reports/RPT-2024-001/pptx</code>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Efficiency Widget */}
      <GlassCard variant="elevated" className="p-8">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Zap className="text-accent" />
          Efficiency Calculator
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div>
              <Label htmlFor="baseline">Your Baseline (minutes)</Label>
              <Input
                id="baseline"
                type="number"
                value={baselineMinutes}
                onChange={(e) => setBaselineMinutes(Number(e.target.value))}
                className="text-lg"
              />
              <p className="text-sm text-muted-foreground mt-1">
                How long would this analysis normally take you?
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock size={16} />
                IBRAE Time: {(processingMs / 1000).toFixed(1)}s
              </div>
              <div className="flex items-center gap-1">
                <Clock size={16} />
                Your Time: {baselineMinutes}min
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-accent mb-2">
              {efficiency > 0 ? `${efficiency}%` : '0%'}
            </div>
            <div className="text-lg text-foreground mb-1">Efficiency Gain</div>
            <p className="text-sm text-muted-foreground">
              IBRAE saved you {efficiency > 0 ? ((baselineMinutes * 60 - processingMs/1000) / 60).toFixed(1) : '0'} minutes
            </p>
            
            {efficiency > 50 && (
              <div className="mt-4 p-3 bg-accent/10 rounded-lg border border-accent/20">
                <p className="text-sm text-accent font-medium">
                  🎉 Incredible time savings! You're {efficiency}% more efficient with IBRAE.
                </p>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};