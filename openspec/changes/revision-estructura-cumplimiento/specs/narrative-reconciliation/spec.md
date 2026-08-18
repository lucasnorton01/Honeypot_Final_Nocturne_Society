# Narrative Reconciliation Specification

## Purpose

Enforce the director-approved rule: Chapter-5/6 numbers come ONLY from `analitica/honeypot.db` and `analitica/tablas/*.csv`, with the 201,125-event corpus as the single base and the 13-event control test clearly separated.

## Requirements

### Requirement: R-08 — Single traceable number base (MUST)

All published Chapter-5/6 numbers MUST trace to `honeypot.db` or `tablas/*.csv`. Canonical values: events 201,125 (= 157,234 cowrie + 43,891 dionaea), iocs 4,234, reports 30, error_log 10,660, sessions 6,730, unique IPs 3,128, 94.7% structured. A documented command set MUST reproduce every count; the DB is canonical and MUST NOT be edited to fit text.

**Verification:** `sqlite3 analitica/honeypot.db "SELECT COUNT(*) FROM events"` → 201125 (likewise iocs, reports, error_log, proto_session, pais_temp); a reconciliation script (`scripts/verificar_reconciliacion`) exits 0 when all counts match, non-zero otherwise.

#### Scenario: All counts match the base

- GIVEN honeypot.db with the canonical counts
- WHEN the reconciliation script runs
- THEN it exits 0 and prints all seven counts matching the canonical table

#### Scenario: Text number not reproducible

- GIVEN a thesis figure absent from the base
- WHEN reconciliation runs
- THEN the mismatch is reported and the thesis (never the DB) is corrected

### Requirement: R-09 — Separated narratives, corrected claims (MUST)

The thesis MUST clearly separate the campaign corpus (201,125 events, 13/07–11/08) from the controlled validation test (13 events, session d7525579e2e2, 11/08 12:45–12:47). Passages around former lines 2056/2226/2427/2664/3368 MUST be rewritten so that: no sentence presents 13 events as campaign volume; claims not reproducible from the base (e.g., ">99%" reduction) are removed or reframed; §5.13.1 text MUST state the 2+3+3 node structure matching its table.

**Verification:** grep `tesis-extendida.md` — "201.125" occurrences consistent with the canonical framing; every "13 eventos" occurrence sits in a validation-labeled context; ">99%" at former L2427 absent or reframed; "6 nodos"/"6 nodes" absent from §5.13.1.

#### Scenario: Mixed narrative found

- GIVEN a passage presenting 13 events as the campaign volume
- WHEN the reconciliation pass runs
- THEN the passage is rewritten into two separated sets, with the checkpoint (R-11) enabling revert

### Requirement: R-10 — Canonical latency minimum (MUST)

`analitica/kpis.json` `latencia.min` MUST be 85.496 (matching resumen-dataset.json), replacing the clock-skew artifact −839.504. A dated note in BITACORA MUST explain the correction, and "839" MUST NOT appear as a latency value in the thesis.

**Verification:** `python -c "import json;print(json.load(open('analitica/kpis.json'))['latencia']['min'])"` → 85.496; grep BITACORA.md for "85.496"; grep tesis-extendida.md for "839.504" → zero hits.

#### Scenario: kpis still shows the negative value

- GIVEN `min` still equals −839.504
- WHEN verification runs
- THEN acceptance fails until the canonical value and the dated annotation exist

### Requirement: R-11 — Reversible thesis edits (MUST)

Before ANY edit to `tesis-extendida.md`, either a timestamped backup (`tesis-extendida.md.bak-YYYYMMDD`) or the pre-edit git commit MUST exist. The pre-edit state MUST be restorable byte-identical via `git checkout` / `git show`.

**Verification:** `Test-Path tesis-extendida.md.bak-*` is true, or `git log --oneline -- tesis-extendida.md` shows a pre-edit commit; after a revert, `git diff` is empty.

#### Scenario: Edit without checkpoint blocked

- GIVEN no backup and no pre-edit commit
- WHEN an edit to the thesis is attempted
- THEN the edit is blocked until a checkpoint exists

#### Scenario: Revert restores the original

- GIVEN a checkpoint and an applied edit
- WHEN `git checkout` restores the checkpoint
- THEN the file is byte-identical to the pre-edit state
