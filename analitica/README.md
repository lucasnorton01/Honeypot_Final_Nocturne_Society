Derivado del dataset SINTÉTICO (honeypot.db, generado por generar_dataset.js). No es evidencia del pipeline.

## Archivos

- `honeypot.db` — Base de datos SQLite generada por `scripts/generar_sqlite.py` a partir del dump SQL sintético.
- `kpis.json` — Indicadores derivados de honeypot.db.
- `tablas/` — CSVs exportados desde honeypot.db para análisis en Databricks.
- `parquet/` — Archivos Parquet derivados de honeypot.db para notebooks Databricks.
