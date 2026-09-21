#!/usr/bin/env python3
"""exportar_ejecuciones_n8n.py — Export of real n8n execution records (R-05/R-06).

Reads the n8n execution database (SQLite via `docker cp`, or PostgreSQL as
fallback) and writes a dated evidence artifact:

    evidencia/n8n-executions-YYYYMMDD.json   (+ .sha256 manifest)

The artifact contains one record per REAL n8n execution with fields:
execution id, workflow name, trigger mode (trigger type), start time, end
time and status.  No record is added, edited or backfilled: the header
declares the real validation window (2026-08-11 13:58Z -> 2026-08-12 20:00Z,
UTC instants per n8n storage; local equivalent 10:58 -> 17:00 -03:00) and
the no-fabrication commitment.

Honesty rules enforced here:
  * The count in the header is ALWAYS the actual DB count at snapshot time.
  * Any execution with a start time BEFORE the declared window start fails
    the export (exit code 2, no artifact written) — never silently dropped.
  * Executions still running have stoppedAt = null and are exported as-is.
  * Timestamps are stored by n8n in UTC; they are normalized to ISO-8601
    with an explicit +00:00 suffix so window checks are unambiguous.

Usage:
    python scripts/exportar_ejecuciones_n8n.py <db-path> [--out out.json] [--window-start ISO] [--window-end ISO]
    DB_TYPE=postgres python scripts/exportar_ejecuciones_n8n.py postgres://user:pass@host:5432/n8n ...
"""  # noqa: E501

import argparse
import hashlib
import json
import os
import sqlite3
import sys
from datetime import datetime, timezone

# Declared validation window (design C5 / spec R-06).
# The n8n SQLite stores timestamps as UTC instants; the declared window
# "2026-08-11T13:58 -> 2026-08-12T20:00" corresponds to the FIRST and LAST
# execution timestamps of the validation period, which are UTC. Earlier
# drafts labeled this window "-03:00"; that was a mislabel of n8n's UTC
# storage (corrected here, documented in BITACORA/README). Exact boundaries:
# start = floor of the first execution start (13:58:13.631Z), end = last
# validation-era execution start (ioc-extractor, 20:00 cycle, +143 ms).
# Local equivalents (-03:00): 2026-08-11T10:58 -> 2026-08-12T17:00.
WINDOW_START_DEFAULT = "2026-08-11T13:58:00+00:00"
WINDOW_END_DEFAULT = "2026-08-12T20:00:00.143+00:00"

SOURCE_SQLITE = "n8n execution_entity/workflow_entity (SQLite)"
SOURCE_POSTGRES = "n8n execution_entity/workflow_entity (PostgreSQL)"

EXECUTIONS_SQL = """
SELECT ee.id, we.name, ee.mode, ee.startedAt, ee.stoppedAt, ee.status
FROM execution_entity ee
JOIN workflow_entity we ON ee.workflowId = we.id
ORDER BY ee.id
"""


def parse_args(argv):
    parser = argparse.ArgumentParser(description="Export real n8n execution records to a dated evidence artifact.")
    parser.add_argument("db_path", help="Path to the copied n8n SQLite database file (or a postgres:// URL when DB_TYPE=postgres).")
    parser.add_argument("--out", default=None, help="Output JSON path (default: evidencia/n8n-executions-YYYYMMDD.json).")
    parser.add_argument("--window-start", default=WINDOW_START_DEFAULT, help=f"Declared window start (default {WINDOW_START_DEFAULT}).")
    parser.add_argument("--window-end", default=WINDOW_END_DEFAULT, help=f"Declared window end (default {WINDOW_END_DEFAULT}).")
    return parser.parse_args(argv)


def probe_db_type(db_path):
    """Probe the DB type: environment DB_TYPE wins; a postgres:// URL implies Postgres; default SQLite."""
    db_type = os.environ.get("DB_TYPE", "").strip().lower()
    if db_type in ("postgres", "postgresql", "pg"):
        return "postgres"
    if db_path.startswith("postgres://") or db_path.startswith("postgresql://"):
        return "postgres"
    return "sqlite"


def read_sqlite_executions(db_path):
    """Read executions from a copied SQLite database, read-only. Returns (rows, integrity_check)."""
    uri = "file:{}?mode=ro".format(db_path.replace("\\", "/"))
    conn = sqlite3.connect(uri, uri=True)
    try:
        integrity = conn.execute("PRAGMA integrity_check").fetchone()[0]
        if integrity != "ok":
            raise RuntimeError(
                "SQLite integrity_check failed on snapshot: {!r}. "
                "The docker cp snapshot is inconsistent (WAL race); re-copy "
                "database.sqlite + database.sqlite-wal together and retry.".format(integrity)
            )
        rows = conn.execute(EXECUTIONS_SQL).fetchall()
    finally:
        conn.close()
    return rows, integrity


def read_postgres_executions(db_url):
    """Read executions from PostgreSQL (fallback, same SQL). Requires psycopg2."""
    try:
        import psycopg2  # type: ignore
    except ImportError as exc:
        raise RuntimeError(
            "DB_TYPE=postgres was requested but psycopg2 is not installed "
            "on this host; aborting rather than fabricating."
        ) from exc
    conn = psycopg2.connect(db_url)
    try:
        with conn.cursor() as cur:
            cur.execute(EXECUTIONS_SQL)
            rows = cur.fetchall()
    finally:
        conn.close()
    return rows, "n/a (postgres)"


def to_iso_utc(value):
    """Normalize an n8n timestamp (UTC, 'YYYY-MM-DD HH:MM:SS[.mmm]') to ISO-8601 with +00:00."""
    if value is None:
        return None
    text = str(value).strip()
    if not text:
        return None
    text = text.replace(" ", "T", 1)
    if text.endswith("Z"):
        return text
    if "+" not in text and not text.endswith("Z") and "T" in text:
        return text + "+00:00"
    return text


def parse_ts(iso):
    """Parse an ISO-8601 timestamp into an aware datetime (UTC-normalized)."""
    text = iso.replace("Z", "+00:00")
    if text.endswith("+00:00"):
        return datetime.fromisoformat(text)
    return datetime.fromisoformat(text).astimezone(timezone.utc)


def build_artifact(rows, integrity, db_type, snapshot_ts, window_start, window_end):
    executions = []
    null_stopped = 0
    for row in rows:
        exec_id, workflow_name, mode, started_at, stopped_at, status = row
        stopped = to_iso_utc(stopped_at)
        if stopped is None:
            null_stopped += 1
        executions.append(
            {
                "id": exec_id,
                "workflow": workflow_name,
                "mode": mode,
                "startedAt": to_iso_utc(started_at),
                "stoppedAt": stopped,
                "status": status,
            }
        )

    window_start_utc = parse_ts(window_start).isoformat().replace("+00:00", "Z")
    window_end_utc = parse_ts(window_end).isoformat().replace("+00:00", "Z")
    count_before = sum(1 for r in executions if r["startedAt"] and parse_ts(r["startedAt"]) < parse_ts(window_start))
    count_after = sum(1 for r in executions if r["startedAt"] and parse_ts(r["startedAt"]) > parse_ts(window_end))
    count_in_window = len(executions) - count_before - count_after

    header = {
        "source": SOURCE_SQLITE if db_type == "sqlite" else SOURCE_POSTGRES,
        "db_type": db_type,
        "integrity_check": integrity,
        "snapshot": snapshot_ts,
        "count": len(executions),
        "window": {
            "start": window_start_utc,
            "end": window_end_utc,
            "local_equivalent_start_minus03": "2026-08-11T10:58:00-03:00",
            "local_equivalent_end_minus03": "2026-08-12T17:00:00-03:00",
            "note": "n8n stores timestamps as UTC instants; the declared window matches the first (13:58Z) and last (20:00Z) executions of the validation period",
        },
        "declarations": [
            "no records exist before the declared window start (2026-08-11T13:58:00Z)",
            "no fabrication: every record was copied verbatim from the n8n execution database",
            "timestamps normalized to UTC (+00:00) from n8n UTC storage",
        ],
        "notes": {
            "executions_within_window": count_in_window,
            "executions_before_window_start": count_before,
            "executions_after_window_end": count_after,
            "executions_with_null_stoppedAt": null_stopped,
            "stoppedAt_null_means_still_running": True,
        },
    }
    return {"header": header, "executions": executions}


def validate_artifact(artifact, window_start, window_end):
    """Enforce R-06: non-empty id/status/startedAt per record; no record before the window start."""
    problems = []
    by_id = {}
    for rec in artifact["executions"]:
        if rec["id"] in by_id:
            problems.append("duplicate execution id: {}".format(rec["id"]))
        by_id[rec["id"]] = True
        if not rec["id"]:
            problems.append("record with empty id")
        if not rec["status"]:
            problems.append("record {} has empty status".format(rec["id"]))
        if not rec["startedAt"]:
            problems.append("record {} has empty startedAt".format(rec["id"]))
            continue
        started = parse_ts(rec["startedAt"])
        if started < parse_ts(window_start):
            problems.append(
                "record {} startedAt {} is BEFORE the declared window start {} (R-06 violation)".format(
                    rec["id"], rec["startedAt"], window_start
                )
            )
    return problems


def write_sha256_manifest(json_path, artifact_bytes):
    digest = hashlib.sha256(artifact_bytes).hexdigest()
    manifest_path = json_path + ".sha256"
    with open(manifest_path, "w", encoding="ascii") as fh:
        fh.write("{}  {}\n".format(digest, os.path.basename(json_path)))
    return digest


def main(argv=None):
    args = parse_args(argv)
    db_type = probe_db_type(args.db_path)

    if db_type == "sqlite":
        rows, integrity = read_sqlite_executions(args.db_path)
    else:
        rows, integrity = read_postgres_executions(args.db_path)

    snapshot_ts = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    out_path = args.out or "evidencia/n8n-executions-{}.json".format(datetime.now(timezone.utc).strftime("%Y%m%d"))

    artifact = build_artifact(rows, integrity, db_type, snapshot_ts, args.window_start, args.window_end)

    problems = validate_artifact(artifact, args.window_start, args.window_end)
    if problems:
        for p in problems:
            print("[FAIL] " + p, file=sys.stderr)
        print("No artifact was written. Fix the data or re-run the export from the real DB.", file=sys.stderr)
        return 2

    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    payload = json.dumps(artifact, ensure_ascii=False, indent=2) + "\n"
    raw = payload.encode("utf-8")
    # Binary write: Windows text mode would translate \n -> \r\n and make the
    # manifest hash diverge from the on-disk bytes.
    with open(out_path, "wb") as fh:
        fh.write(raw)
    digest = write_sha256_manifest(out_path, raw)

    min_started = min((r["startedAt"] for r in artifact["executions"]), default=None)
    max_started = max((r["startedAt"] for r in artifact["executions"]), default=None)
    print("[OK] count={}".format(artifact["header"]["count"]))
    print("[OK] min_startedAt={}".format(min_started))
    print("[OK] max_startedAt={}".format(max_started))
    print("[OK] artifact={}".format(out_path))
    print("[OK] sha256={} {}".format(digest, os.path.basename(out_path)))
    return 0


if __name__ == "__main__":
    sys.exit(main())