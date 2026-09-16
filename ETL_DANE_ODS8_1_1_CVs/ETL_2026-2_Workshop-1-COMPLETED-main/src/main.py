"""Entry point for the ETL pipeline.

The `main` function orchestrates extraction, transformation, validation
(placeholder), and loading.  Replace or extend the validation logic
to meet the project’s quality checks.
"""

from __future__ import annotations

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

from extract import extract_all
from transform import transform_all
from load import load_all


def main() -> None:
    print("[INFO] Starting ETL pipeline...")
    raw_dfs = extract_all()
    cleaned_dfs = transform_all(raw_dfs)
    # TODO: add validation logic here (row counts, null checks, etc.)
    load_all(cleaned_dfs)
    print("[INFO] ETL pipeline completed.")

if __name__ == "__main__":
    main()
