# IBRAE — Business Insights Engine

Upload a CSV or Excel file and get it cleaned, summarized, and analyzed:
descriptive stats, missing-value and outlier detection, domain KPIs
(sales / HR / marketing, with a generic fallback for anything else), and
insights derived directly from the data (trend, correlation, concentration).
Export the result as a PDF or email it to yourself.

Every number shown in the dashboard is computed from the file you upload —
there is no mocked, randomized, or placeholder data anywhere in this app.

---

## Project structure

```
ibra-insightflow/
├── src/                  React + TypeScript frontend (Vite)
│   ├── components/
│   │   ├── UploadSection.tsx    file upload / Google Sheets URL fetch
│   │   ├── Dashboard.tsx        KPI cards, insights, dataset summary
│   │   └── ReportActions.tsx    PDF download, email export
│   └── pages/Index.tsx          page wiring
├── go-backend/           Go backend — THE backend the frontend talks to
│   ├── main.go           HTTP server (routes, CORS)
│   ├── table.go          CSV/XLSX parsing into an in-memory table
│   ├── clean.go          dedup + forward/backward fill
│   ├── analyze.go        summary stats, type detection, KPI computation
│   ├── insights.go       trend / correlation / outlier / concentration insights
│   └── pdf.go            PDF report generation
└── backend/              DEPRECATED legacy Node/Express + Python backend.
                           Kept for reference only — not used anymore.
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm
- [Go](https://go.dev/dl/) 1.21+

---

## 1. Run the backend (Go)

```sh
cd go-backend
go run .
```

You should see:

```
Backend running on port 5000
```

To build a standalone binary instead:

```sh
cd go-backend
go build -o ibrae-backend .
./ibrae-backend
```

The backend listens on `http://localhost:5000` and needs no configuration,
database, or API keys.

---

## 2. Run the frontend (Vite/React)

In a separate terminal, from the project root:

```sh
npm install
npm run dev
```

Vite will print a local URL (typically `http://localhost:5173`). Open it in
a browser — the frontend expects the Go backend to already be running on
`localhost:5000`.

Other frontend scripts:

```sh
npm run build       # production build
npm run build:dev   # development-mode build
npm run preview     # preview a production build locally
npm run lint        # run eslint
```

---

## 3. Using the app

1. Go to the **Upload File** tab (or **Google Sheets URL** to fetch a public
   CSV export link) and pick a `.csv`, `.xlsx`, or `.xls` file.
2. The file is sent to the Go backend, which cleans it, computes stats, and
   derives KPIs and insights.
3. The dashboard shows:
   - **KPIs** — domain-specific (e.g. `revenue_growth`, `churn_rate`,
     `conversion_rate`) when the dataset matches a known type, plus generic
     KPIs (row count, per-column averages) that are always present.
   - **Insights** — plain-language observations actually derived from the
     data (trend direction, strongest correlation, worst outlier column,
     most-missing column, dominant category), not templated or random text.
   - **Dataset summary** — shape, columns, missing-value counts.
4. Use **Download PDF Report** or **Email Report** (in the Export & Share
   section) to get the results out of the browser.

If the backend is unreachable or a file can't be analyzed, the app shows a
real error message — it never silently falls back to fake data.

---

## API reference (Go backend, port 5000)

### `POST /api/upload`

Multipart form upload, field name `file`. Accepts `.csv`, `.xlsx`, `.xls`.

Response body:

```json
{
  "summary": {
    "shape": [rows, cols],
    "columns": ["..."],
    "summary": { "<column>": { "count": 0, "mean": 0, "std": 0, "min": 0, "max": 0 } },
    "missing": { "<column>": 0 },
    "outliers": { "<column>": [0.0] }
  },
  "kpis": { "<kpi_name>": 0.0 },
  "type": "sales | hr | marketing | generic",
  "insights": ["..."]
}
```

On failure, responds with HTTP 422 and `{"error": "..."}`.

### `POST /api/generate-pdf`

Accepts the same JSON shape as the `/api/upload` response and streams back a
`report.pdf` file (`Content-Type: application/pdf`).

### `GET /api/download`

Serves the most recently generated `report.pdf` from the backend's working
directory, if one exists.

---

## Notes

- CORS is wide open (`Access-Control-Allow-Origin: *`) for local development.
  Tighten this before deploying anywhere public.
- Uploaded files are stored under `go-backend/uploads/`, which is
  git-ignored — nothing you upload gets committed.
- `backend/` (Node/Express + Python) is deprecated and kept only for
  reference; the frontend does not call it.
