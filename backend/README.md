# IBRA Backend

## Features
- File upload (CSV, Excel, Google Sheets link)
- Data cleaning (remove duplicates, handle missing values, standardize dates)
- Automated exploratory analysis (summary stats, outlier detection)
- KPI calculation (dataset-type detection, relevant KPIs)
- Visualization (auto-generate charts)
- Report export (PDF, PPTX)
- Custom insights (top 3 actionable items)
- Email integration (optional)

## How to Run
1. Install Node.js dependencies:
   ```cmd
   cd backend
   npm install
   ```
2. Install Python dependencies:
   ```cmd
   pip install pandas numpy fpdf openpyxl xlrd
   ```
3. Start the backend server:
   ```cmd
   npm start
   ```

## API Endpoints
- `POST /api/upload` — Upload and analyze file
- `POST /api/report` — Generate PDF/PPTX report

Python scripts handle data processing and report generation.
