"""Extracción de datos oficiales del DANE (EMC, hoja 1.1a - CVs)."""

from __future__ import annotations

from pathlib import Path
from typing import Dict

import pandas as pd

BASE_DIR = Path(__file__).resolve().parents[1]
RAW_DIR = BASE_DIR / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "data" / "processed"
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


def extract_all() -> Dict[str, pd.DataFrame]:
    """Lee el archivo oficial del DANE y la hoja 1.1a -CVs- Int.

    No se modifica el Excel original; la interpretación de sus encabezados
    se realiza en la etapa de transformación.
    """
    dfs: Dict[str, pd.DataFrame] = {}
    path = RAW_DIR / "emc_cv.xlsx"
    if not path.exists():
        raise FileNotFoundError(f"No se encontró el archivo oficial: {path}")

    df = pd.read_excel(path, sheet_name="1.1a -CVs- Int.", header=None)
    dfs["emc_cv"] = df
    print(f"[INFO] Extraído DANE: {path.name} | hoja 1.1a -CVs- Int. | {df.shape[0]} filas x {df.shape[1]} columnas")
    return dfs


if __name__ == "__main__":
    raw = extract_all()
    for name, df in raw.items():
        print(f"{name}: {df.shape[0]} filas, {df.shape[1]} columnas")
