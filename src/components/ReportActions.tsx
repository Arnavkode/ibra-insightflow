import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GlassCard } from "./GlassCard";
import { FileText, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportActionsProps {
  reportData?: any;
}

export const ReportActions = ({ reportData }: ReportActionsProps) => {
  const [emailTo, setEmailTo] = useState("");
  const { toast } = useToast();

  const handleDownloadPdf = async () => {
    if (!reportData) {
      toast({ title: "No report to export", description: "Upload and analyze a file first.", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'report.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast({ title: "PDF generation failed", description: String(err), variant: "destructive" });
    }
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
    const kpis = reportData?.kpis || {};
    const insights: string[] = Array.isArray(reportData?.insights) ? reportData.insights : [];
    let body = `Business Insights Report\n\nType: ${reportData?.type ?? 'N/A'}\n\nKPIs:\n`;
    Object.entries(kpis).forEach(([k, v]) => {
      body += `- ${k.replace(/_/g, ' ')}: ${typeof v === 'number' ? v.toFixed(2) : v}\n`;
    });
    body += `\nInsights:\n`;
    insights.forEach((ins) => { body += `- ${ins}\n`; });
    const mailto = `mailto:${encodeURIComponent(emailTo)}?subject=${encodeURIComponent("IBRAE Analytics Report")}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
    setEmailTo("");
  };

  return (
    <div className="space-y-6">
      <GlassCard variant="elevated" className="p-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Export & Share</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-16 flex-col gap-2"
            onClick={handleDownloadPdf}
          >
            <FileText size={20} />
            Download PDF
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
                <p className="text-sm text-muted-foreground">
                  Opens your email client with the report summary pre-filled.
                </p>
                <Button onClick={handleEmailReport} className="w-full">
                  Open in Email Client
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </GlassCard>
    </div>
  );
};
