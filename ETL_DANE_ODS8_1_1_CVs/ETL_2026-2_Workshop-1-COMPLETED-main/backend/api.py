from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text

app = FastAPI(title="DANE EMC - ODS 8 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

POSTGRES_URI = "postgresql://danielfernandoparradiaz@localhost/etl_workshop"
engine = create_engine(POSTGRES_URI)


def run_query(query: str):
    with engine.connect() as conn:
        return [dict(row) for row in conn.execute(text(query)).mappings().all()]


@app.get("/api/cv_series")
def cv_series():
    query = """
    SELECT year, month, month_name, activity, cv_pct,
           variation_pct, confidence_lower, confidence_upper
    FROM fact_emc_cv
    WHERE period = 'Variación anual'
    ORDER BY year, month, activity
    """
    return run_query(query)


@app.get("/api/cv_summary")
def cv_summary():
    query = """
    SELECT activity,
           ROUND(AVG(cv_pct)::numeric, 3) AS avg_cv,
           ROUND(MAX(cv_pct)::numeric, 3) AS max_cv,
           ROUND(AVG(variation_pct)::numeric, 3) AS avg_variation
    FROM fact_emc_cv
    WHERE period = 'Variación anual'
    GROUP BY activity
    ORDER BY activity
    """
    return run_query(query)


@app.get("/api/latest")
def latest():
    query = """
    SELECT period, activity, year, month, month_name,
           cv_pct, variation_pct, confidence_lower, confidence_upper
    FROM fact_emc_cv
    WHERE date_key = (SELECT MAX(date_key) FROM fact_emc_cv)
    ORDER BY period, activity
    """
    return run_query(query)
