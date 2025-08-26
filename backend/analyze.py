import sys
import pandas as pd
import numpy as np
import json

def clean_data(df):
    df = df.drop_duplicates()
    df = df.fillna(method='ffill').fillna(method='bfill')
    for col in df.select_dtypes(include=['datetime', 'object']):
        try:
            df[col] = pd.to_datetime(df[col], errors='ignore')
        except:
            pass
    return df

def get_summary(df):
    def safe(obj):
        if isinstance(obj, (pd.Timestamp, np.datetime64)):
            return str(obj)
        if isinstance(obj, dict):
            return {k: safe(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [safe(v) for v in obj]
        return obj
    return {
        'shape': tuple(df.shape),
        'columns': [str(c) for c in df.columns.tolist()],
        'summary': safe(df.describe(include='all').to_dict()),
        'missing': safe(df.isnull().sum().to_dict()),
        'outliers': safe({col: df[col][(np.abs(df[col] - df[col].mean()) > 3 * df[col].std())].tolist() for col in df.select_dtypes(include=[np.number])})
    }

def detect_type(df):
    cols = df.columns.str.lower()
    if any('sales' in c or 'revenue' in c for c in cols):
        return 'sales'
    if any('employee' in c or 'hr' in c for c in cols):
        return 'hr'
    if any('customer' in c or 'marketing' in c for c in cols):
        return 'marketing'
    return 'generic'

def main():
    file_path = sys.argv[1]
    try:
        # Try reading as Excel first
        try:
            df = pd.read_excel(file_path, engine='openpyxl')
        except Exception:
            try:
                df = pd.read_excel(file_path, engine='xlrd')
            except Exception:
                try:
                    df = pd.read_csv(file_path)
                except Exception as e:
                    print(json.dumps({'error': f'File read error: {str(e)}'}))
                    return
    except Exception as e:
        print(json.dumps({'error': f'File read error: {str(e)}'}))
        return
    try:
        df = clean_data(df)
        summary = get_summary(df)
        dtype = detect_type(df)
        kpis = {}
        if dtype == 'sales':
            if 'revenue' not in df.columns or 'profit' not in df.columns:
                print(json.dumps({'error': 'Missing required columns for sales analysis: revenue, profit'}))
                return
            kpis['revenue_growth'] = float(df['revenue'].pct_change().mean())
            kpis['profit_margin'] = float(df['profit'].mean() / df['revenue'].mean())
        elif dtype == 'hr':
            if 'employee_left' not in df.columns:
                print(json.dumps({'error': 'Missing required column for HR analysis: employee_left'}))
                return
            kpis['churn_rate'] = float(df['employee_left'].sum() / len(df))
        elif dtype == 'marketing':
            if 'converted' not in df.columns:
                print(json.dumps({'error': 'Missing required column for marketing analysis: converted'}))
                return
            kpis['conversion_rate'] = float(df['converted'].sum() / len(df))
        result = {
            'summary': summary,
            'kpis': kpis,
            'type': dtype
        }
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({'error': f'Analysis error: {str(e)}'}))
        return

if __name__ == '__main__':
    main()
