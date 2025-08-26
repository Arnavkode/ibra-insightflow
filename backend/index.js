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

app.listen(5000, () => {
  console.log('Backend running on port 5000');
});
