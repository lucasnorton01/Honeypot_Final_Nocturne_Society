#!/usr/bin/env python3
"""verificar_reconciliacion.py — Proof that published Chapter-5/6 numbers trace
to analitica/honeypot.db and analitica/kpis.json (R-08/R-10).

Reads the REAL SQLite database read-only (stdlib sqlite3, no third-party
dependencies) plus analitica/kpis.json and prints one PASS/FAIL line per
canonical value. Exits 0 iff EVERY check passes, 1 otherwise.

The database is canonical and is NEVER edited by this script; if the real
values differ from the canonical table, the mismatch is reported honestly
(the thesis, not the DB, is what gets corrected — R-08 scenario 2).

Canonical values (spec narrative-reconciliation R-08/R-10, design C7/C8):
  events ......... 201125  (157234 cowrie + 43891 dionaea)
  iocs ........... 4234
  reports ........ 30
  error_log ...... 10660
  proto_session .. 6730
  pais_temp ...... 3128     (unique source IPs)
  tasa ........... ~94.70% ± 0.05  (100 * (1 - error_log/events))
  kpis.json latencia.min ... 85.496  (canonical; matches resumen-dataset.json)
  kpis.json ips_publicas ... 3128

Usage:
    python scripts/verificar_reconciliacion.py [--db DB_PATH] [--kpis KPIS_PATH]
    scripts/verificar_reconciliacion.bat   (Windows wrapper, same behavior)

Exit codes: 0 = all checks pass; 1 = one or more checks fail.
"""  # noqa: E501

import argparse
import json
import os
import sqlite3
import sys

# Canonical table (R-08). The DB is the source of truth; these values were
# published in the spec and MUST match the real DB — never the reverse.
CANONICAL = {
    "events": 201125,
    "iocs": 4234,
    "reports": 30,
    "error_log": 10660,
    "proto_session": 6730,
    "pais_temp": 3128,
}

TASA_TOLERANCE_PP = 0.05  # percentage points, design contract (R-08: +/- 0.05)

KPIS_LATENCIA_MIN = 85.496  # R-10: canonical minimum latency (resumen-dataset.json)
KPIS_IPS_PUBLICAS = 3128  # R-08: unique public IPs

TASA_DERIVED_NOTE = "100 * (1 - error_log / events)"


def repo_root():
    """Repo root = parent of the scripts/ directory (works from any cwd)."""
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def parse_args(argv):
    parser = argparse.ArgumentParser(
        description="Verify Chapter-5/6 canonical numbers against the real honeypot DB (R-08/R-10)."
    )
    parser.add_argument(
        "--db",
        default=None,
        help="Path to honeypot.db (default: <repo>/analitica/honeypot.db).",
    )
    parser.add_argument(
        "--kpis",
        default=None,
        help="Path to kpis.json (default: <repo>/analitica/kpis.json).",
    )
    return parser.parse_args(argv)


def read_db_counts(db_path):
    """Return {table: count} for every canonical table. Missing tables are
    reported as None (the caller turns them into FAILs, not crashes)."""
    conn = sqlite3.connect("file:{}?mode=ro".format(db_path.replace("\\", "/")), uri=True)
    try:
        integrity = conn.execute("PRAGMA integrity_check").fetchone()[0]
        counts = {}
        for table in CANONICAL:
            try:
                counts[table] = conn.execute("SELECT COUNT(*) FROM {}".format(table)).fetchone()[0]
            except sqlite3.OperationalError:
                counts[table] = None
    finally:
        conn.close()
    return counts, integrity


def read_kpis(kpis_path):
    """Return (latencia_min, ips_publicas) or (None, None) if unreadable."""
    try:
        with open(kpis_path, "r", encoding="utf-8") as fh:
            data = json.load(fh)
        return data.get("latencia", {}).get("min"), data.get("ips_publicas")
    except (OSError, ValueError):
        return None, None


def check_table_counts(counts):
    """Per-table PASS/FAIL. Returns (all_ok, n_fail)."""
    results = []
    all_ok = True
    for table, expected in sorted(CANONICAL.items()):
        real = counts.get(table)
        ok = real == expected
        all_ok = all_ok and ok
        if real is None:
            results.append("[FAIL] {}: table missing/unreadable (canonical {})".format(table, expected))
        elif ok:
            results.append("[PASS] {}={} (canonical {})".format(table, real, expected))
        else:
            results.append("[FAIL] {}={} (canonical {})".format(table, real, expected))
    return results, all_ok


def check_tasa(counts):
    """Derived check: tasa = 100 * (1 - error_log / events) must be ~94.70% (+/- 0.05)."""
    events = counts.get("events")
    errors = counts.get("error_log")
    if events is None or errors is None:
        return "[FAIL] tasa: events/error_log unavailable (canonical ~94.70 % +/- 0.05)", False
    tasa = 100.0 * (1.0 - errors / events)
    ok = abs(tasa - 94.70) <= TASA_TOLERANCE_PP
    line = "[PASS]" if ok else "[FAIL]"
    line += " tasa={:.4f} % (canonical ~94.70 % +/- 0.05; {})".format(tasa, TASA_DERIVED_NOTE)
    return line, ok


def check_kpis(latencia_min, ips_publicas):
    """R-10 + R-08 kpis.json checks."""
    results = []
    all_ok = True
    if latencia_min is None:
        results.append("[FAIL] kpis.json latencia.min: unreadable/missing (canonical 85.496)")
        all_ok = False
    else:
        ok = abs(latencia_min - KPIS_LATENCIA_MIN) < 1e-9
        all_ok = all_ok and ok
        line = "[PASS]" if ok else "[FAIL]"
        results.append("{} kpis.json latencia.min={} (canonical {})".format(line, latencia_min, KPIS_LATENCIA_MIN))
    if ips_publicas is None:
        results.append("[FAIL] kpis.json ips_publicas: unreadable/missing (canonical 3128)")
        all_ok = False
    else:
        ok = ips_publicas == KPIS_IPS_PUBLICAS
        all_ok = all_ok and ok
        line = "[PASS]" if ok else "[FAIL]"
        results.append("{} kpis.json ips_publicas={} (canonical {})".format(line, ips_publicas, KPIS_IPS_PUBLICAS))
    return results, all_ok


def main(argv=None):
    args = parse_args(argv)
    root = repo_root()
    db_path = args.db or os.path.join(root, "analitica", "honeypot.db")
    kpis_path = args.kpis or os.path.join(root, "analitica", "kpis.json")

    if not os.path.isfile(db_path):
        print("[FAIL] honeypot.db not found at {}".format(db_path), file=sys.stderr)
        return 1

    counts, integrity = read_db_counts(db_path)
    latencia_min, ips_publicas = read_kpis(kpis_path)

    print("[INFO] db={}".format(db_path))
    print("[INFO] integrity_check={}".format(integrity))

    table_lines, tables_ok = check_table_counts(counts)
    tasa_line, tasa_ok = check_tasa(counts)
    kpis_lines, kpis_ok = check_kpis(latencia_min, ips_publicas)

    all_ok = tables_ok and tasa_ok and kpis_ok
    for line in table_lines + [tasa_line] + kpis_lines:
        print(line)

    if all_ok:
        print("[OK] Reconciliacion: todos los numeros canonicos coinciden con la base real.")
        return 0
    print("[FAIL] Reconciliacion: {} desviacion(es) respecto del canonico.".format(
        sum(1 for l in table_lines + [tasa_line] + kpis_lines if l.startswith("[FAIL]"))
    ), file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())