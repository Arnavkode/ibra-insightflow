import sys
import json
from fpdf import FPDF

def generate_pdf(data, options):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font('Arial', 'B', 16)
    pdf.cell(0, 10, 'Business Insights Report', ln=True)
    pdf.set_font('Arial', '', 12)
    pdf.cell(0, 10, f"Type: {data.get('type', 'N/A')}", ln=True)
    pdf.cell(0, 10, 'KPIs:', ln=True)
    for k, v in data.get('kpis', {}).items():
        pdf.cell(0, 10, f"{k}: {v}", ln=True)
    pdf.cell(0, 10, 'Summary:', ln=True)
    for k, v in data.get('summary', {}).items():
        pdf.cell(0, 10, f"{k}: {v}", ln=True)
    pdf.output('report.pdf')
    return 'report.pdf'

def main():
    data = json.loads(sys.argv[1])
    options = json.loads(sys.argv[2])
    pdf_path = generate_pdf(data, options)
    print(pdf_path)

if __name__ == '__main__':
    main()
