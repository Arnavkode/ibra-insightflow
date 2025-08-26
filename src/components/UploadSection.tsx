import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { GlassCard } from "./GlassCard";
import { Upload, FileText, Link, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const UploadSection = () => {
  const [dragActive, setDragActive] = useState(false);
  const [generatePdf, setGeneratePdf] = useState(true);
  const [generatePptx, setGeneratePptx] = useState(false);
  const [persistReport, setPersistReport] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleFiles = (file: File) => {
    const validTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV or Excel file (.csv, .xlsx, .xls)",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "File uploaded successfully",
      description: `${file.name} is ready for analysis`,
    });
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      toast({
        title: "Analysis complete!",
        description: "Your dashboard is ready with insights and KPIs",
      });
    }, 3000);
  };

  return (
    <GlassCard variant="elevated" className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Upload Your Data</h2>
        <p className="text-muted-foreground">Transform your data into actionable insights instantly</p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload size={16} />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2">
            <Link size={16} />
            Google Sheets URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <div
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
              dragActive 
                ? 'border-primary bg-primary/5 scale-105' 
                : 'border-glass-border hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg mb-2">Drag & drop your CSV or Excel file here</p>
            <p className="text-muted-foreground mb-6">or</p>
            <Button variant="outline" size="lg">
              Browse Files
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Supports CSV, XLSX, XLS files up to 10MB
            </p>
          </div>
        </TabsContent>

        <TabsContent value="url" className="space-y-6">
          <div className="space-y-4">
            <Input 
              placeholder="https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv"
              className="text-base py-3"
            />
            <p className="text-sm text-muted-foreground">
              Paste your public Google Sheets CSV export URL. 
              <a href="#" className="text-primary hover:underline ml-1">
                Learn how to get the URL
              </a>
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Options */}
      <div className="mt-8 p-6 bg-muted/30 rounded-xl space-y-4">
        <h3 className="font-semibold text-foreground mb-4">Report Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="pdf" 
              checked={generatePdf} 
              onCheckedChange={setGeneratePdf}
            />
            <Label htmlFor="pdf">Generate PDF</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="pptx" 
              checked={generatePptx} 
              onCheckedChange={setGeneratePptx}
            />
            <Label htmlFor="pptx">Generate PPTX</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="persist" 
              checked={persistReport} 
              onCheckedChange={setPersistReport}
            />
            <Label htmlFor="persist">Persist Report</Label>
          </div>
        </div>
      </div>

      {/* Analyze Button */}
      <div className="mt-8 text-center">
        <Button 
          size="xl" 
          variant="hero"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="min-w-48"
        >
          {isAnalyzing ? (
            <>
              <Zap className="mr-2 h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze Data'
          )}
        </Button>
        
        <p className="text-sm text-muted-foreground mt-4">
          <span className="font-medium text-accent">⚡ IBRAE improves reporting efficiency by up to 80%*</span>
          <br />
          <span className="text-xs">*computed from processing time vs your baseline</span>
        </p>
      </div>
    </GlassCard>
  );
};