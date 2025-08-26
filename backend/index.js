import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { PythonShell } from 'python-shell';
import path from 'path';
import PDFDocument from 'pdfkit';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.post('/api/upload', upload.single('file'), (req, res) => {
  // Debug log: file upload
  console.log('[UPLOAD] Received file:', req.file?.originalname, 'Stored at:', req.file?.path);
  const filePath = req.file.path;
  PythonShell.run('analyze.py', { args: [filePath] }, (err, results) => {
    if (err) {
      console.error('[UPLOAD] Python error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    console.log('[UPLOAD] Python results:', results);
    res.json({ results });
  });
});


app.post('/api/report', (req, res) => {
  // Debug log: report generation
  console.log('[REPORT] Request body:', req.body);
  const { data, options } = req.body;
  PythonShell.run('generate_report.py', { args: [JSON.stringify(data), JSON.stringify(options)] }, (err, results) => {
    if (err) {
      console.error('[REPORT] Python error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    console.log('[REPORT] Python results:', results);
    res.json({ report: results, pdfPath: 'report.pdf' });
  });
});

// Serve the generated PDF file
app.get('/api/download', (req, res) => {
  const filePath = path.join(process.cwd(), 'report.pdf');
  res.download(filePath, 'Business_Insights_Report.pdf', err => {
    if (err) res.status(404).send('File not found');
  });
});

// Generate PDF from posted JSON payload and stream back
app.post('/api/generate-pdf', (req, res) => {
  try {
    const payload = req.body || {};
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
    const doc = new PDFDocument();
    doc.pipe(res);
    doc.fontSize(18).text('Business Insights Report', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Type: ${payload.type || 'auto'}`);
    doc.moveDown();
    if (payload.summary && Array.isArray(payload.summary.columns)) {
      doc.text(`Columns: ${payload.summary.columns.join(', ')}`);
      doc.moveDown();
    }
    if (payload.kpis) {
      doc.text('KPIs:');
      Object.entries(payload.kpis).forEach(([k, v]) => {
        doc.text(`- ${k.replace(/_/g, ' ')}: ${v}`);
      });
      doc.moveDown();
    }
    if (payload.insights && Array.isArray(payload.insights)) {
      doc.text('Top Insights:');
      payload.insights.forEach((ins) => {
        doc.text(`- ${ins}`);
      });
    }
    doc.end();
  } catch (err) {
    console.error('[PDF] generation error', err);
    res.status(500).json({ error: 'PDF creation failed' });
  }
});

app.listen(5000, () => {
  console.log('Backend running on port 5000');
});
