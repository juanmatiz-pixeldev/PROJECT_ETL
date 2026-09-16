"""Transformación de la hoja 1.1a - CVs de la EMC del DANE.

La hoja contiene 3 períodos (variación anual, año corrido y doce meses),
4 actividades comerciales y las variables Var, L.i, L.s y C.v.
La transformación normaliza esa estructura para facilitar consultas SQL.
"""

from __future__ import annotations

from typing import Dict

import pandas as pd

ACTIVITIES = {
    0: "Total comercio mayorista",
    1: "462-463-4641-4642-4643-4644-4649. Materias primas agropecuarias; alimentos, bebidas y tabaco; artículos y enseres domésticos",
    2: "4645. Productos farmacéuticos, medicinales, cosméticos y de tocador",
    3: "465-466-469. Maquinaria y equipo; especializado y no especializado",
}
PERIODS = {
    0: "Variación anual",
    1: "Variación año corrido",
    2: "Variación doce meses",
}
MONTHS = {
    "enero": 1, "febrero": 2, "marzo": 3, "abril": 4,
    "mayo": 5, "junio": 6, "julio": 7, "agosto": 8,
    "septiembre": 9, "octubre": 10, "noviembre": 11, "diciembre": 12,
}

# ── BUG FIX: cada bloque de actividad ocupa 4 columnas (Var, L.i, L.s, C.v),
#    no 5 como asumía el código original. El offset erróneo desplazaba las
#    lecturas y mezclaba datos entre actividades. ──
COLS_PER_ACTIVITY = 4
COLS_PER_PERIOD = COLS_PER_ACTIVITY * len(ACTIVITIES)  # 16


def _month_number(value) -> int | None:
    text = str(value).strip().lower()
    for name, number in MONTHS.items():
        if text.startswith(name):
            return number
    return None


def transform_emc_cv(df: pd.DataFrame) -> pd.DataFrame:
    """Convierte la estructura ancha del Excel a una tabla analítica larga."""
    rows = []
    data = df.copy()

    current_year = None
    for i in range(9, len(data)):
        year_value = data.iloc[i, 0]
        if pd.notna(year_value):
            try:
                current_year = int(float(year_value))
            except (TypeError, ValueError):
                pass
        month = _month_number(data.iloc[i, 1])
        if current_year is None or month is None:
            continue

        for period_idx, period_name in PERIODS.items():
            base = 2 + period_idx * COLS_PER_PERIOD
            for activity_idx, activity_name in ACTIVITIES.items():
                col = base + activity_idx * COLS_PER_ACTIVITY
                values = data.iloc[i, col : col + COLS_PER_ACTIVITY].tolist()
                if len(values) < COLS_PER_ACTIVITY:
                    continue
                var, li, ls, cv = values
                if pd.isna(var) and pd.isna(cv):
                    continue
                rows.append(
                    {
                        "year": current_year,
                        "month": month,
                        "month_name": str(data.iloc[i, 1]).strip(),
                        "period": period_name,
                        "activity": activity_name,
                        "variation_pct": pd.to_numeric(var, errors="coerce"),
                        "confidence_lower": pd.to_numeric(li, errors="coerce"),
                        "confidence_upper": pd.to_numeric(ls, errors="coerce"),
                        "cv_pct": pd.to_numeric(cv, errors="coerce"),
                    }
                )

    result = pd.DataFrame(rows)
    if result.empty:
        raise ValueError(
            "No se encontraron registros válidos en la hoja 1.1a -CVs- Int."
        )

    result["date_key"] = result["year"] * 100 + result["month"]
    result = result[
        [
            "date_key", "year", "month", "month_name", "period", "activity",
            "variation_pct", "confidence_lower", "confidence_upper", "cv_pct",
        ]
    ]
    return result.sort_values(
        ["year", "month", "period", "activity"]
    ).reset_index(drop=True)


def transform_all(raw_dfs: Dict[str, pd.DataFrame]) -> Dict[str, pd.DataFrame]:
    cleaned: Dict[str, pd.DataFrame] = {}
    if "emc_cv" not in raw_dfs:
        raise KeyError("No se encontró el DataFrame emc_cv extraído del DANE.")

    fact = transform_emc_cv(raw_dfs["emc_cv"])
    cleaned["fact_emc_cv"] = fact
    print(f"[INFO] Transformado fact_emc_cv: {len(fact)} registros.")
    return cleaned


if __name__ == "__main__":
    import sys

    sys.path.append(str(__import__("pathlib").Path(__file__).parent))
    from extract import extract_all

    out = transform_all(extract_all())
    print(out["fact_emc_cv"].head())
