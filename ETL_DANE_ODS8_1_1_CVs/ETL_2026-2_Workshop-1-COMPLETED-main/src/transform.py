"""Transformación de la hoja 1.1a - CVs de la EMC del DANE.

Estructura real del Excel (verificada sobre emc_cv.xlsx):
  - Fila 0-5:  título y metadatos
  - Fila 6:    encabezados de período  → cols 3, 22, 42
  - Fila 7:    encabezados de actividad
  - Fila 8:    sub-encabezados (Var, L.i, L.s, C.v)
  - Fila 9+:   datos (col 0 = Año, col 1 = Mes)

Cada período ocupa 20 columnas (4 actividades × 5 cols, donde la 5ª
es un NaN separador).  Los bases de período son 2, 22 y 42.
"""

from __future__ import annotations

from typing import Dict

import pandas as pd

# ── Posiciones absolutas de columna verificadas en el Excel real ──────────────
PERIOD_BASES = [2, 22, 42]
PERIOD_NAMES = [
    "Variación anual",
    "Variación año corrido",
    "Variación doce meses",
]

# Offset relativo al base de cada período (stride = 5: 4 datos + 1 NaN)
ACTIVITY_OFFSETS = [0, 5, 10, 15]
ACTIVITY_NAMES = [
    "Total comercio mayorista",
    "462-463-4641-4642-4643-4644-4649. Materias primas agropecuarias; alimentos, bebidas y tabaco; artículos y enseres domésticos",
    "4645. Productos farmacéuticos, medicinales, cosméticos y de tocador",
    "465-466-469. Maquinaria y equipo; especializado y no especializado",
]

MONTHS = {
    "enero": 1, "febrero": 2, "marzo": 3, "abril": 4,
    "mayo": 5, "junio": 6, "julio": 7, "agosto": 8,
    "septiembre": 9, "octubre": 10, "noviembre": 11, "diciembre": 12,
}


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

        for pb, pn in zip(PERIOD_BASES, PERIOD_NAMES):
            for ao, an in zip(ACTIVITY_OFFSETS, ACTIVITY_NAMES):
                col = pb + ao
                values = data.iloc[i, col : col + 4].tolist()
                if len(values) < 4:
                    continue
                var, li, ls, cv = values
                if pd.isna(var) and pd.isna(cv):
                    continue
                rows.append({
                    "year": current_year,
                    "month": month,
                    "month_name": str(data.iloc[i, 1]).strip(),
                    "period": pn,
                    "activity": an,
                    "variation_pct": pd.to_numeric(var, errors="coerce"),
                    "confidence_lower": pd.to_numeric(li, errors="coerce"),
                    "confidence_upper": pd.to_numeric(ls, errors="coerce"),
                    "cv_pct": pd.to_numeric(cv, errors="coerce"),
                })

    result = pd.DataFrame(rows)
    if result.empty:
        raise ValueError(
            "No se encontraron registros válidos en la hoja 1.1a -CVs- Int."
        )

    result["date_key"] = result["year"] * 100 + result["month"]
    result = result[[
        "date_key", "year", "month", "month_name", "period", "activity",
        "variation_pct", "confidence_lower", "confidence_upper", "cv_pct",
    ]]
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
    print(out["fact_emc_cv"].head(8))
