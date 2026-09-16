"""Carga de la tabla analítica de la EMC del DANE en PostgreSQL."""

from __future__ import annotations

import os
from pathlib import Path

import pandas as pd
from sqlalchemy import create_engine, text

BASE_DIR = Path(__file__).resolve().parents[1]
SQL_DDL_PATH = BASE_DIR / "sql" / "create_dw.sql"

# ── BUG FIX: usar variable de entorno en lugar de credenciales hardcodeadas ──
POSTGRES_URI = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost/etl_workshop",
)


def get_engine():
    return create_engine(POSTGRES_URI)


def run_ddl(engine) -> None:
    ddl = SQL_DDL_PATH.read_text(encoding="utf-8")
    statements = [s.strip() for s in ddl.split(";") if s.strip()]
    with engine.begin() as conn:
        for stmt in statements:
            conn.execute(text(stmt))
    print("[INFO] Esquema DANE creado.")


def load_fact(engine, df: pd.DataFrame) -> None:
    # ── BUG FIX: reemplazar tabla en lugar de append para evitar duplicados
    #    al correr el ETL más de una vez.
    df.to_sql(
        "fact_emc_cv",
        engine,
        if_exists="replace",  # era "append" → genera duplicados en reruns
        index=False,
        method="multi",
    )
    print(f"[INFO] Cargados {len(df)} registros en fact_emc_cv.")


def load_all(cleaned_dfs: dict[str, pd.DataFrame]) -> None:
    engine = get_engine()
    run_ddl(engine)
    load_fact(engine, cleaned_dfs["fact_emc_cv"])


if __name__ == "__main__":
    import sys

    sys.path.append(str(Path(__file__).parent))
    from extract import extract_all
    from transform import transform_all

    load_all(transform_all(extract_all()))
