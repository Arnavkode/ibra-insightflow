import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { GlassCard } from "./GlassCard";
import { Upload, FileText, Link, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadSectionProps {
  onAnalyze?: (reportData?: any) => void;
}

export const UploadSection = ({ onAnalyze }: UploadSectionProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [generatePdf, setGeneratePdf] = useState(true);
  const [generatePptx, setGeneratePptx] = useState(false);
  const [persistReport, setPersistReport] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sheetUrl, setSheetUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFiles = async (file: File) => {
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
      title: "Uploading...",
      description: `${file.name} is being sent for analysis`,
    });

    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      let resultObj = undefined;
      if (data.results && Array.isArray(data.results) && typeof data.results[0] === 'string') {
        try {
          resultObj = JSON.parse(data.results[0]);
        } catch (e) {
          resultObj = data.results[0];
        }
      } else {
        resultObj = data;
      }
      if (resultObj && resultObj.error) {
        toast({
          title: "Analysis failed",
          description: resultObj.error,
          variant: "destructive"
        });
        if (onAnalyze) onAnalyze(undefined);
      } else {
        toast({
          title: "Analysis complete!",
          description: "Your dashboard is ready with insights and KPIs",
        });
        if (onAnalyze) onAnalyze(resultObj);
      }
    } catch (err) {
      toast({
        title: "Analysis failed",
        description: "Could not process file. Try again later.",
        variant: "destructive"
      });
      if (onAnalyze) onAnalyze(undefined);
    }
  };

  const handleAnalyze = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsAnalyzing(false);
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleGoogleSheetAnalyze = async () => {
    if (!sheetUrl || !sheetUrl.startsWith("https://")) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Google Sheets CSV export URL.",
        variant: "destructive"
      });
      return;
    }
    setIsAnalyzing(true);
    try {
      const res = await fetch(sheetUrl);
      if (!res.ok) throw new Error("Failed to fetch Google Sheet");
      const csvText = await res.text();
      // Convert CSV text to Blob and File
      const blob = new Blob([csvText], { type: "text/csv" });
      const file = new File([blob], "google_sheet.csv", { type: "text/csv" });
      await handleFiles(file);
    } catch (err) {
      toast({
        title: "Google Sheets fetch failed",
        description: "Could not fetch or process the Google Sheet.",
        variant: "destructive"
      });
    }
    setIsAnalyzing(false);
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
            <Button variant="outline" size="lg" onClick={handleAnalyze} disabled={isAnalyzing}>
              Browse Files
            </Button>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
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
              value={sheetUrl}
              onChange={e => setSheetUrl(e.target.value)}
              disabled={isAnalyzing}
            />
            <Button variant="outline" size="lg" onClick={handleGoogleSheetAnalyze} disabled={isAnalyzing}>
              Fetch & Analyze Google Sheet
            </Button>
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