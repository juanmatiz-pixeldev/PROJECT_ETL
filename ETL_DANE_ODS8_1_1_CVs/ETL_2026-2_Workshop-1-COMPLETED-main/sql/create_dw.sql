-- Data Warehouse para la EMC del DANE: hoja 1.1a - CVs
DROP TABLE IF EXISTS fact_emc_cv CASCADE;

CREATE TABLE fact_emc_cv (
    date_key INTEGER NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    month_name TEXT NOT NULL,
    period TEXT NOT NULL,
    activity TEXT NOT NULL,
    variation_pct DOUBLE PRECISION,
    confidence_lower DOUBLE PRECISION,
    confidence_upper DOUBLE PRECISION,
    cv_pct DOUBLE PRECISION,
    PRIMARY KEY (date_key, period, activity)
);

CREATE INDEX idx_emc_cv_period ON fact_emc_cv(period);
CREATE INDEX idx_emc_cv_activity ON fact_emc_cv(activity);
CREATE INDEX idx_emc_cv_date ON fact_emc_cv(year, month);
