# Design: Revision of structure and audit compliance (Etapas 0–3)

## Technical Approach

Four staged deliverables, each ending in one commit; history stays linear, never rewritten (R-01). **Etapa 0 — Publish:** `git init -b main`, `.gitignore` audit, initial commit (full tree minus ignored), pre-push secrets scan, annotated tag `Honeypot_Cowrie`, push gated on D1. **Etapa 1 — Evidence:** export 136 n8n executions into a dated `evidencia/` artifact with snapshot hash; honest cron/validation-window declaration (path b; path a opportunistic). **Etapa 2 — Reconciliation:** script-proven single number base (201,125) from `analitica/honeypot.db` only; targeted thesis edits behind a mandatory checkpoint; `kpis.json` canonical fix. **Etapa 3 — Hygiene + verify:** LICENSE (MIT), `.github/SECURITY.md`, README updates, dedicated junk-deletion commit, `docs/verificacion-auditoria.md` re-check → 0 NOT MET in scope. No stack rerun needed for any number.

## Architecture Decisions

### D1 — Push gate
| Option | Tradeoff | Decision |
|---|---|---|
| Push now | Credentials; irrecoverable if secret slips | Push fully prepared, executed ONLY after explicit user authorization (stop-and-wait at apply) |
| Defer | Clause (c) unmet remotely | Commit+tag stay local; BITACORA records "push diferido" with the exact future command |

### D2 — Tag
`git tag -a Honeypot_Cowrie -m "Estado canónico post-Etapas 0–3 (2026-08-18)"` on the **final** change commit (tag = complete professional state). Rejected: tag on initial commit (would predate LICENSE/evidence commits). Runs before the D1 push/defer step.

### D3 — Thesis edits (checkpoint)
Default: reversible SDD edits. `Copy-Item tesis-extendida.md tesis-extendida.md.bak-20260818` **and** pre-edit git commit must exist before the first edit (R-11); user reviews the full diff pre-commit; fallback = guidance-only mode if user prefers hand edits. Recorded as an apply checkpoint question.

### D4 — n8n basic auth
Document-only: README Security section + `.github/SECURITY.md` state the editor has no auth (local lab only) and list `N8N_BASIC_AUTH_*` as follow-up; `.env.example` gains a commented block. Rejected: editing compose now — requires a stack restart and risks the evidence window.

## Decisions per capability

| # | Capability | Choice | Why (vs rejected) |
|---|---|---|---|
| C1 | History | `git init -b main` (git 2.55), one linear chain, no amend/rebase | R-01; rename-from-master is noise |
| C2 | .gitignore | Add `*.db`, `analitica/parquet/`, `analitica/databricks/`, `*token*`, `*secret*`, `*chat*`, `*.pem`; track `.env.example`, `analitica/tablas/*.csv`, `analitica/kpis.json`, `analitica/consultas.sql` | honeypot.db (57 MB) ignored (R-02); tablas are director-approved Chapter-5 sources |
| C3 | Secrets scan | `scripts/scan_secrets.ps1` over `git ls-files`; patterns: bot token `\d{8,10}:[A-Za-z0-9_-]{35}`, `api.telegram.org/bot`, `-----BEGIN.*PRIVATE KEY-----`, `sk-[A-Za-z0-9]{20,}`, `AKIA[0-9A-Z]{16}`, chat-id values `-?\d{9,12}`; allowlist decoy `admin:test123`; exit≠0 on hit | gitleaks = external install; checklist-only fails R-03's gate |
| C4 | Export source | Probe `DB_TYPE` (compose has none → SQLite `/home/node/.n8n/database.sqlite`); `docker cp` → host python `sqlite3`; Postgres fallback with same SQL. Tables `execution_entity` ⋈ `workflow_entity` (id, workflowId, mode=trigger, startedAt, stoppedAt, status) | REST API is auth-state dependent; sqlite3 not in n8n image |
| C5 | Artifact | `scripts/exportar_ejecuciones_n8n.py` → `evidencia/n8n-executions-20260818.json` (header: source, snapshot ts, count 136, window 2026-08-11T13:58→2026-08-12T20:00, no-records-before/no-fabrication declarations) + `.sha256` manifest | Backfill = prohibited (R-06) |
| C6 | Cron | Keep `"0 8 * * *"` (grep-verified); compose `restart: unless-stopped` unchanged; path (b) honest declaration in README+BITACORA unless a real cron execution appears before export | Simulated cron record prohibited (R-07) |
| C7 | Reconciliation | `scripts/verificar_reconciliacion.py` (+`.bat` wrapper); python stdlib sqlite3; canonical dict; exit 0 iff ALL match | sqlite3 CLI absent on Windows |
| C8 | kpis.json | `latencia.min` −839.504 → 85.496 + dated BITACORA note (clock-skew artifact; resumen-dataset.json canonical) | Editing DB to fit text = director-rule violation |
| C9 | License | Root `LICENSE` MIT verbatim, `Copyright (c) 2026 Nocturne Society (Crespo, Norton, Santos)`; apply confirms holder string | Audit expects MIT per BITACORA |
| C10 | Junk | Dedicated commit AFTER initial commit deletes `_tmp300.sql`, `_tmp_kpis.py`, `scripts/_test_parse.py`; no `_trash/` — git is the rollback | Pre-init delete violates R-13 recoverability |
| C11 | Re-check | `docs/verificacion-auditoria.md`: full audit table; C-01..C-04, C-11, C-15, C-17, C-20, C-25, C-28, clause b → VERIFIED + rerunnable command + output; C-07..C-10, C-18, C-19, C-24 → OUT-OF-SCOPE with reasons; BITACORA points to it | Keeps dated log clean |

## Data / Evidence Flow

```
n8n SQLite (execution_entity ⋈ workflow_entity) ──docker cp──▶ host Python ──▶ evidencia/n8n-executions-20260818.json (+.sha256)
   └─ declared in README (Evidence) + BITACORA + .github/SECURITY.md (window, no-fabrication)
honeypot.db (events/iocs/reports/error_log/proto_session/pais_temp) ──▶ verificar_reconciliacion.py ──▶ 7 canonical numbers + kpis.json checks
   └─ thesis invariants (grep-guarded) ── checkpoint (bak + commit) ──▶ rewritten passages ──▶ stage commit
Working tree ── scan (git ls-files) ──▶ per-stage commits ──▶ tag Honeypot_Cowrie ──(D1 gate)──▶ push origin main --tags
```

## File Changes

| File | Action | Why |
|---|---|---|
| `.gitignore` | Modify | Add R-02 entries (C2) |
| `scripts/scan_secrets.ps1` | Create | R-03 gate |
| `scripts/exportar_ejecuciones_n8n.py` | Create | R-05 export |
| `scripts/verificar_reconciliacion.py` + `.bat` | Create | R-08 proof |
| `evidencia/n8n-executions-20260818.json` (+`.sha256`) | Create (gitignored) | Clause (b) |
| `analitica/kpis.json` | Modify | min → 85.496 (R-10) |
| `tesis-extendida.md` | Modify (D3) | Reconciliation (R-09/R-11) |
| `LICENSE`, `.github/SECURITY.md` | Create | R-12 |
| `README.md` | Modify | MIT + repo URL + evidence/cron window + monitoring + no-auth note |
| `BITACORA.md` | Modify | Dated entries: kpis fix, cron declaration, push status, export |
| `docs/verificacion-auditoria.md` | Create | R-14 |
| `_tmp300.sql`, `_tmp_kpis.py`, `scripts/_test_parse.py` | Delete (dedicated commit) | R-13 |
| `.env.example` | Modify | Commented `N8N_BASIC_AUTH` block (D4) |

## Thesis Edit Plan (R-09; anchors by content — lines shifted post-Fase D)

| Anchor | Current | Required end-state |
|---|---|---|
| §5.2.4 (≈L2056) | 201,125 campaign + 13-event control | Verify-only: sets already separated; keep |
| §5.3.6 note (≈L2226) | "reducción superior al 99 %" | Reframe "≈99 % (estimación conservadora: 297 ms medidos vs ~30 s estimados, NIST)"; remove ">99 %" |
| §5.10 P1 (≈L2427) | "margen amplio (reducción > 99 %)" | Replace with ≈99 % estimado; hypothesis tied to reproducible base |
| §6.1.1 (≈L2664) | "201.125 (volumen típico según la literatura)" | Reframe: 201,125 = measured corpus 13/07–11/08; projection language only for manual-vs-auto extrapolation |
| §7.2.2 (≈L3368) | "corpus de 201.125 (volumen típico…)" | Same reframe; keep non-measured caveat |
| Resumen (L17–45) | 13-event validation only; "repo contiene el volcado" | Add separated campaign sentence; fix repo-contents claim (dump = evidence, not in git) |
| §5.13.1 (≈L2490) | "secuencia de siete nodos: …" | Rewrite to 2+3+3 structure matching the §5.13 table (2 entry / 3 processing / 3 persistence per table); no standalone "siete/6 nodos" count |
| All | — | "839.504" absent (R-10); every "13 eventos" in validation-labeled context |

Checkpoint: backup copy + pre-edit commit before FIRST edit; restore byte-identical via copy or `git checkout` (verify `git diff` empty).

## Commands per Stage

| Stage | Commands (PowerShell, repo root) |
|---|---|
| 0 | `git init -b main`; confirm identity (`git config user.name/email`); `git add -A`; `powershell -File scripts/scan_secrets.ps1` → exit 0; positive control (temp dummy-token file) → exit 1; `git commit -m "chore: estado canónico inicial (Etapa 0)"`; `git remote add origin https://github.com/lucasnorton01/Honeypot_Final_Nocturne_Society.git` |
| 1 | `docker compose exec n8n sh -lc 'ls /home/node/.n8n; echo $DB_TYPE'`; `docker cp n8n:/home/node/.n8n/database.sqlite <tmp>`; `python scripts/exportar_ejecuciones_n8n.py <tmp> --out evidencia/n8n-executions-20260818.json`; assert count 136, timestamps ≥ window start; write `.sha256`; README/BITACORA declarations; commit |
| 2 | `python scripts/verificar_reconciliacion.py` → 0; checkpoint bak + commit; edit kpis.json + thesis per plan; greps: `839.504`→0, `>99`→0, `6 nodos\|siete nodos`→0 (§5.13.1), `2+3+3`→1, `201.125` consistent; user diff review; commit |
| 3 | Write LICENSE/`.github`/README/`.env.example`/docs; `git add -A`; commit deleting the 3 junk files (`git log --diff-filter=D --name-only` = exactly them); run every `docs/verificacion-auditoria.md` command top-to-bottom; `git tag -a Honeypot_Cowrie -m "…"`; D1: `git push -u origin main --tags` or BITACORA deferral; final `git status` clean |

## Interfaces / Contracts

- **Reconciliation script**: exit 0 iff events=201125, iocs=4234, reports=30, error_log=10660, proto_session=6730, pais_temp=3128, tasa=1−errors/events ≈94.70% (±0.05), kpis.json `latencia.min=85.496`, `ips_publicas=3128`. Prints per-check PASS/FAIL.
- **Export JSON**: `{"header":{"source":"n8n execution_entity/workflow_entity","snapshot":"<ISO>","count":136,"window":{"start":"2026-08-11T13:58:00-03:00","end":"2026-08-12T20:00:00-03:00"},"declarations":["no records before declared window","no fabrication"]},"executions":[{"id":1,"workflow":"event-ingest","mode":"webhook","startedAt":"…","stoppedAt":"…","status":"success"}]}` — `mode` is the trigger type; `cli` marks manual runs (honest).

## Testing Strategy (no framework; tdd=false per config)

| Layer | What | How |
|---|---|---|
| Positive control | Scan gates push / flags secrets | dummy-token temp file → exit 1 (R-03 scenario) |
| Negative control | Reconciliation detects mismatch | temp expectation change → non-zero (R-08) |
| Data | Export completeness | count==136; every startedAt ≥ window start (R-05/R-06) |
| E2E | Re-check commands rerunnable | execute `docs/verificacion-auditoria.md` top-to-bottom (R-14) |

## Threat Matrix (routing/shell/subprocess/VCS boundaries present)

| Boundary | Applicability | Safe behavior | Failure behavior | RED test |
|---|---|---|---|---|
| Git repository selection | Applicable — all git at repo root, no `-C` | commands resolve in repo | wrong cwd → git errors pre-commit | control: root `git rev-parse` OK |
| Commit state | Applicable — explicit `git add -A` per stage, no `commit -a` | staged tree matches stage boundary | junk leaks into commit | `git status` clean + per-stage `git log --stat` |
| Push state | Applicable — first push `-u origin main --tags` | refs reach remote only post-D1 | secret pushed = unrecoverable | scan exit-0 gate + positive control |
| Executable-file classification | Applicable — `scan_secrets.ps1`/`.bat` invoked explicitly | `powershell -File` invocation only; no auto-run docs | accidental run of junk `_test_parse.py` | junk absent post-deletion |
| PR commands | N/A — no PR automation | — | — | — |
| Documentation-like paths | N/A — no executable docs | — | — | — |

## Migration / Rollout

No data migration; stack NOT restarted. Stages are independent commits; push deferred until D1. Opportunistic cron re-validation (path a): if a real cron execution appears before export it is included; after export the artifact is frozen (R-05 scenario).

## Risks & Mitigations

| Risk | Sev | Mitigation |
|---|---|---|
| Secret enters public repo | High | Scan gate + allowlist + dispatch-sensitive ignores (R-02/R-03) |
| Push authorization missing | Med | Local commit+tag; deferral documented (D1) |
| n8n execution_entity schema drift | Med | Probe + defensive SELECT; REST fallback documented in script |
| Thesis edit drift | Med | Checkpoint + diff review (D3) + post-edit greps |
| Cron re-validation impossible | Low | Path (b) satisfies R-07 |
| Copyright holder string wrong | Low | Apply checkpoint confirm (default = R-12 text) |

## Rollback

- Push: `git push origin --delete` refs / unpublish remote.
- Thesis: restore `.bak-20260818` or `git checkout` pre-edit commit (byte-identical).
- kpis.json: revert stage commit.
- Junk: `git checkout <initial-commit> -- _tmp300.sql` (R-13 scenario).
- Evidence artifact: delete gitignored file; no history impact.

## Open Questions

- [ ] D1 at apply: authorize push now or defer?
- [ ] D3 at apply: SDD edits (default) or guidance-only?
- [ ] Copyright holder string (default: "2026 Nocturne Society (Crespo, Norton, Santos)")
- [ ] Git identity name/email for commits