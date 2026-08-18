# Evidence Export Specification

## Purpose

Satisfy audit clause (b): export the real n8n execution records into a dated `evidencia/` artifact with an honest declaration of the validation window. Fabrication of missing records is a hard prohibition.

## Requirements

### Requirement: R-05 — Complete execution export (MUST)

A dated artifact `evidencia/n8n-executions-YYYYMMDD.json` MUST contain one record per real n8n execution with fields: execution id, workflow name, trigger type, start time, end time, status. The record count MUST equal the n8n execution DB count at the snapshot moment (136 as of 2026-08-18). The artifact header MUST record the source, snapshot timestamp, and count.

**Verification:** `python -c "import json;d=json.load(open('evidencia/n8n-executions-20260818.json'));print(len(d['executions']))"` prints 136; every record has non-empty id, status, and timestamps; header declares the DB source.

#### Scenario: Snapshot matches DB

- GIVEN the n8n execution DB contains 136 executions
- WHEN the export runs at the snapshot moment
- THEN the artifact contains exactly 136 complete records matching the DB

#### Scenario: Executions added after snapshot

- GIVEN new executions occur after the artifact timestamp
- WHEN the count is re-checked later
- THEN the artifact remains valid as a dated snapshot; its header count equals the DB count at snapshot time

### Requirement: R-06 — No fabricated evidence (MUST NOT)

The export MUST NOT add, edit, or backfill any record, and MUST NOT invent executions for 13/07–10/08. The artifact and README MUST declare the real window (2026-08-11 13:58 → 2026-08-12 20:00) and state explicitly that no n8n records exist before it.

**Verification:** every timestamp in the artifact is ≥ 2026-08-11 13:58; grep the artifact header and README for the declared window and the no-records-before statement.

#### Scenario: Auditor asks for July records

- GIVEN a request for executions covering 13/07–10/08
- WHEN the evidence is produced
- THEN the artifact and README state the true window and that no fabrication was performed

#### Scenario: Out-of-window record detected

- GIVEN a record with a timestamp before 2026-08-11 13:58
- WHEN the artifact is validated
- THEN acceptance fails; the record is removed or the export is redone from the real DB

### Requirement: R-07 — Cron repair or honest declaration (SHALL)

`report-generator` MUST keep the schedule `0 8 * * *` in its workflow JSON. The change SHALL deliver exactly one of: (a) a real cron-triggered execution record with success status (opportunistic, requires stack up), or (b) an honest declaration in README/BITACORA that the cron never fired (only 3 cli runs) plus the declared window. A simulated cron record MUST NOT be created.

**Verification:** grep `n8n/workflows/report-generator.json` for `"0 8 * * *"`; then either the export contains a `cron`-triggered run (path a) or README contains the honest declaration (path b).

#### Scenario: Stack up — cron verified

- GIVEN the stack is up and a real cron run fires
- WHEN the export runs afterwards
- THEN a genuine `cron` execution record appears and a matching `reports` INSERT exists

#### Scenario: Stack down — honest declaration

- GIVEN the stack cannot run during the change
- WHEN the cron cannot be re-validated
- THEN path (b) applies: README/BITACORA declare the never-fired cron with evidence; no simulated record is created
