# ETL 2026‑2 Workshop 1 – Complete Project

## Overview
**SDG 8 – Trabajo Decente y Crecimiento Económico**
Problema colombiano: Analizar el dinamismo de ventas minoristas en las principales ciudades de Colombia como proxy de actividad económica y empleo.

This repository contains the complete solution for the **Data Engineering for Sustainable Development** workshop. It covers:

- **ETL pipeline**: extraction, transformation, validation, dimensional model, and load into a **PostgreSQL** data warehouse.
- **Back‑end API**: FastAPI that exposes SQL queries for R1–R5.
- **Front‑end dashboard**: React application (React 18) that fetches data through the API and renders KPIs y visualizaciones.

> **Dataset**: `data/raw/sales.csv` es un conjunto de transacciones minoristas sintéticas con tiendas en Bogotá, Medellín y Cali. Reemplazar con fuente oficial colombiana si se requiere.

**Requisitos analíticos**
- R1: Ventas totales por mes
- R2: Cantidad promedio por producto
- R3: Ventas totales por ciudad y región
- R4: Ventas por canal de venta
- R5: Top 5 productos por ingreso total

## Folder Structure
```
ETL_2026-2_Workshop-1-COMPLETED/
├── backend/                 # FastAPI server
│   ├── api.py
│   └── requirements.txt
├── frontend/                # React UI
│   ├── package.json
│   └── src/
│       ├── App.js
│       ├── components/
│       │   ├── QueryList.jsx
│       │   └── MonthlySalesChart.jsx
├── data/
│   ├── raw/
│   └── processed/
├── notebooks/               # Jupyter notebooks for profiling
├── src/                     # ETL scripts
├── sql/
│   └── create_dw.sql
└── README.md
```

## Getting Started

### 1. Clone
```bash
git clone <repo-url>
cd ETL_2026-2_Workshop-1-COMPLETED
```

### 2. ETL Pipeline
```bash
cd src
python3 main.py
```
Crea/actualiza el Data Warehouse en PostgreSQL `etl_workshop`. El esquema está en `sql/create_dw.sql`.
El proyecto incluye un dataset de muestra en `data/raw/sales.csv`. Reemplazar con datos oficiales colombianos si se requiere.

### 3. Backend
```bash
cd backend
python3 -m pip install -r requirements.txt   # once
python3 -m uvicorn api:app --reload
```
API runs on `http://localhost:8000` and serves:

- `/api/monthly_sales` – R1 ventas totales por mes.
- `/api/avg_quantity_per_product` – R2 cantidad promedio por producto.
- `/api/sales_by_region` – R3 ventas por ciudad y región.
- `/api/sales_by_channel` – R4 ventas por canal.
- `/api/top_products_by_revenue` – R5 top 5 productos por ingreso.

### 4. Front‑end
```bash
cd frontend
npm install
npm start
```
Runs on `http://localhost:3000`. The React dev server proxies `/api/*` to `http://localhost:8000`.

## Dependencies

- *Backend*: `fastapi`, `uvicorn[standard]`, `sqlalchemy`, `psycopg2-binary`
- *Frontend*: `react`, `react-dom`, `react-scripts`, `chart.js`, `react-chartjs-2`
- *ETL*: `pandas`, `sqlalchemy`, `tqdm`, `psycopg2-binary`

(*All installed via pip or npm as shown above.*)

## Extending the Project

- Replace `data/raw/*` with your own dataset.  
- Update `src/transform.py` to match your column names.  
- Add new API endpoints in `backend/api.py`.  
- Add new React components or charts in `frontend/src/components/`.

---  
Happy data engineering!  
