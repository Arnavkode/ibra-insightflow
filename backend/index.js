import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { PythonShell } from 'python-shell';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.post('/api/upload', upload.single('file'), (req, res) => {
  // Call Python script for data cleaning & analysis
  const filePath = req.file.path;
  PythonShell.run('analyze.py', { args: [filePath] }, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ results });
  });
});


app.post('/api/report', (req, res) => {
  // Generate PDF/PPTX report
  const { data, options } = req.body;
  PythonShell.run('generate_report.py', { args: [JSON.stringify(data), JSON.stringify(options)] }, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    // Return path to PDF for download
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

app.listen(5000, () => {
  console.log('Backend running on port 5000');
});
