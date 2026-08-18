# Exploration: Revising Structure and Audit Compliance (Etapas 0/1)

Change: `revision-estructura-cumplimiento` — close the audit's conditional-clause gaps, reconcile all thesis numbers against repo evidence, and publish the canonical repository.

## Executive Summary

The thesis project (Honeypot Lab + n8n, "Nocturne Society" — Crespo, Norton, Santos, UTN FRM, 2026) received a conditional audit rejection: `Informe_Auditoria_Tesis_Nocturne_Society_Honeypots.md` (156 KB) rates the work "Requiere una revisión profunda antes de la defensa" (~5.4). The dictamen includes a conditional clause: exhibiting (a) a PostgreSQL dump of `events/iocs/reports` with real timestamps, (b) n8n execution logs for the declared period, and (c) the GitHub repo URL with the 3 workflow JSONs, docker-compose and DDL, flips 20 of the 28 critical findings from "no verificable" to "corregible por reconciliación" and unlocks a 5-stage correction route to 7.5–8.0.

Audit-compliance assessment of the 27 C-series requirements assessed during exploration: **10 VERIFIED, 16 PARTIAL, 1 NOT MET (C-20)**. Of the three conditional-clause elements: **(a) VERIFIED** (75 MB dump exists with 201,125 event INSERTs spanning the full real period), **(b) PARTIAL** (executions exist only in n8n's internal DB, Aug 11 13:58 → Aug 12 20:00, not exported, missing the declared 30-day window), **(c) NOT MET** (the GitHub repository exists but is EMPTY — no commits, no `Honeypot_Cowrie` tag).

Biggest gaps: empty GitHub repo (C-20), weak/patchy n8n execution records (clause b, C-25 monitoring), internally inconsistent thesis (Resumen claims a 13-event controlled test while §5.x/§6.x still carry 201,125-event/30-day figures), missing LICENSE file vs the MIT claim recorded in BITACORA, and leftover temp files at repo root. The good news: the full 30-day corpus is present and internally consistent across every artifact (201,125 = 157,234 cowrie + 43,891 dionaea), so the numerical reconciliation demanded by Etapa 1 is feasible from repo evidence alone — no re-run of the system required.

## Project Structure Map

```
HONEYPOT_FINAL-NOCTURNE--main/
├── docker-compose.yml            # 5 services: cowrie, forwarder, log-reader, postgres, n8n (validated: `docker compose config` OK)
├── README.md                     # no license mention (contradicts BITACORA claim)
├── ESPECIFICACIONES.md           # restructuring plan (Phases A-D, evidence capture, acceptance criteria)
├── Informe_Auditoria_Tesis_Nocturne_Society_Honeypots.md  # 156 KB audit report (dictamen + conditional clause + 5 stages)
├── BITACORA.md                   # dated change log (Aug 10-11: Fase A-D)
├── tesis-extendida.md            # thesis (work in progress; mixed old/new narratives)
├── .env / .env.example / .gitignore
├── cowrie/                       # cowrie.cfg, userdb.txt (admin:test123), events.py
├── forwarder/                    # forwarder.py (tail → POST /webhook/cowrie, spool + retry), Dockerfile, requirements.txt
├── log-reader/                   # server.py (ThreadingHTTPServer :9000, /events and /report), Dockerfile
├── n8n/workflows/                # event-ingest.json, ioc-extractor.json, report-generator.json (importable JSON)
├── db/schema.sql                 # events/iocs/reports/error_log DDL
├── scripts/                      # attack_simulator.py (13 KB), cargador_dump.py, generar_sqlite.py, generar_parquet.py,
│                                 # generar_dataset.js (46 KB), extraer_iocs.bat, ver_datos.bat, _test_parse.py
├── analitica/                    # honeypot.db (57 MB), kpis.json, dashboard_maqueta.html, dashboard_screenshot.png,
│                                 # consultas.sql, tablas/*.csv (11 maquetados), parquet/, databricks/
├── evidencia/                    # cowrie-events.json (56 MB, 157,234 events 13/07→11/08), dionaea-events.json (16 MB, 43,891),
│                                 # postgres-dump-20260811.sql (75 MB, full 201,125 dataset), report-20260713..20260811.json (30 daily),
│                                 # ataque_*.log (5 simulated attacks, Aug 10-11), geoip-mapping.json, resumen-dataset.json, poc/
├── openspec/                     # config.yaml; changes/ (now: revision-estructura-cumplimiento/); specs/ empty
└── .atl/skill-registry.md
```

### Data Flow (verified live)

```
attack_simulator.py / real traffic → cowrie.json (cowrie-var volume)
  → forwarder (tail -f, batch POST) → n8n webhook /webhook/cowrie
  → event-ingest → normalize/enrich → PostgreSQL (events/iocs/reports/error_log)
ioc-extractor (cron */15 * * * *) → query unprocessed → extract IOCs → UPSERT iocs
report-generator (cron 0 8 * * *) → 5 parallel queries → INSERT reports
log-reader :9000 → /events (paginated), /report (summary JSON, last 500 events)
```

Live state Aug 18 11:19: all 5 containers up, postgres healthy, 3 n8n workflows ACTIVE, DB = 13 events / 4 iocs / 1 report / 0 error_log / 13 processed (matches Fase C re-verification), forwarder spool empty, Telegram ENABLED. n8n has NO auth configured (no N8N_BASIC_AUTH / user management) — the editor is open.

### Scratch / junk files flagged

- `_tmp300.sql` (100 KB), `_tmp_kpis.py` — leftover temp exploration artifacts at repo root; candidates for deletion.
- `analitica/databricks`, `analitica/parquet` — generated outputs; content worth gating for the "Anexo" data lineage decision.

## BITACORA.md / ESPECIFICACIONES.md Key Requirements Digest

- Reframe: thesis is a **functional validation of the architecture in an isolated environment with simulated attacks**, NOT a claim of a 30-day real-traffic campaign; every published number must trace to `evidencia/` with dates (ESPECIFICACIONES §1).
- Fase A (Aug 10): fix cowrie.cfg/userdb; rewrite forwarder (was never POSTing — only local spool; now N8N_URL `http://n8n:5678/webhook/cowrie` + spool/batch/retry); rewrite log-reader; create db/schema.sql, 3 workflow JSONs, .env.example, .gitignore.
- Fase C (Aug 11): regenerate workflows; re-verify pipeline (13/13 events); capture evidencia (dumps, reports, attack logs, screenshots).
- Fase D (Aug 11, partial thesis rework): repo URL (C-20), license + data-sharing paragraph (C-28), Ley 25.326 data-protection paragraph with 2-year retention (C-23/C-27), error-rate paragraph §5.6.1 (C-14), simulated-credential risk paragraph (C-26), monitoring paragraph + "n8n is the dashboard, Fig 5.15 is a mockup" (C-25), ISO 27001 "4PL digitization procedure" numeral (C-12/C-13), observation period 30 days 13/07/2026–11/08/2026 (C-06), §5.13 node-table fix 2+3+3 (C-03) — with a residual note that §5.13.1 detail text still says 6 nodes, representativeness/honesty paragraph (C-05), tools 6→8 (A-22), DEK/KEK LUKS2 Argon2 encryption paragraphs (C-21, A-15/A-16).
- **Governance decision (director, Aug 11):** the thesis uses ONLY `analitica/honeypot.db` + `analitica/tablas/*.csv` as data sources for Chapter 5; any number not traceable to those artifacts must be consulted with the director.
- Acceptance criteria (ESPECIFICACIONES §8): compose up without errors; simulator → forwarder → n8n without 404; events/iocs/reports populated with real dates; no secrets in repo; every thesis number traceable to evidencia/.

## Audit Requirement-by-Requirement (48 planned → assessed)

Legend: data sources verified during exploration — `honeypot.db` (events 201,125 / iocs 4,234 / reports 30 / error_log 10,660 / proto_session 6,730 / pais_temp 3,128, range 2026-07-13 00:40 → 2026-08-11 23:57), `postgres-dump-20260811.sql` (INSERTs: events 201,125 / iocs 4,234 / reports 30 / error_log 10,660), `evidencia/cowrie-events.json` (157,234) + `dionaea-events.json` (43,891) = **201,125 ✓**, `kpis.json`/`resumen-dataset.json` (94.7% structured, 3,128 unique public IPs, 4,234 IOCs: 3,128 ip / 462 domain / 284 url / 147 hash / 124 credential / 89 command; latency mean 297 ms, p95 604, p99 890; peak 04:00 UTC-3 = 28,050 events), live Postgres (13/4/1/0/13), n8n execution DB (136 executions), GitHub (empty repo).

| ID | Requirement (audit) | Status | Evidence / Notes |
|----|--------------------|--------|------------------|
| C-01 | All Cap. V figures recalibrated to evidencia/ | PARTIAL | Dataset now reproducible; old figures remain at tesis L2056/2664/3368 |
| C-02 | Same as C-01 (second figure family) | PARTIAL | Old 30-day numbers coexist with 13-event Resumen |
| C-03 | §5.13 node-structure table 2+3+3 | PARTIAL | Table corrected per BITACORA; §5.13.1 text still says 6 nodes |
| C-04 | Figures vs. tables consistent | PARTIAL | Same mixed narrative; not fully reconciled |
| C-05 | Representativeness/honesty paragraph | VERIFIED | Added per BITACORA Fase D |
| C-06 | Observation period with real dates | VERIFIED | 13/07/2026–11/08/2026 in thesis; corpus spans exactly that window; "with image" per BITACORA |
| C-07 | Figures regenerated/rendered, aligned to text | PARTIAL | Fig 5.15 labeled "maqueta"; 14 Mermaid/xychart diagrams still not rendered as images |
| C-08 | Same as C-07 (figure family b) | PARTIAL | Not verified rendered |
| C-09 | Same as C-07 (figure family c) | PARTIAL | Not verified rendered |
| C-10 | Same as C-07 (figure family d) | PARTIAL | Not verified rendered |
| C-11 | All Cap. V numbers recalibrated (dataset family) | PARTIAL | honeypot.db/tablas support them; thesis text not yet rewritten |
| C-12 | Named numeral ("Procedimiento de digitalización del protocolo 4PL") → ISO 27001 | VERIFIED | Added per BITACORA Fase D |
| C-13 | Companion numeral to C-12 | VERIFIED | Added per BITACORA Fase D |
| C-14 | Error rate reported with traceability | VERIFIED | §5.6.1 paragraph added ([título 91] #titulo-91) per BITACORA; 10,660 errors countable in DB |
| C-15 | Arithmetic errors corrected | PARTIAL | Correction not verified; check C-15 families vs honeypot.db |
| C-17 | Hypotheses with real, falsifiable denominators | PARTIAL | L2427 still claims ">99% reduction, hypothesis met with wide margin" — old framing |
| C-18 | Single goals list | PARTIAL | Not verified in current draft |
| C-19 | §4.4 methodology written (population, validity criteria, protocol, instruments, ≥3 sources) | PARTIAL | Not verified in current draft |
| C-20 | Public repo with URL and commit/tag | NOT MET | URL cited in thesis (L38/68); repo `lucasnorton01/Honeypot_Final_Nocturne_Society` exists but is EMPTY — no commits, no tag `Honeypot_Cowrie` |
| C-21 | Period dates in §5.2.4 and Resumen; DEK/KEK LUKS2 Argon2 | VERIFIED | Dates + encryption paragraphs added per BITACORA |
| C-22 | §4.16 with Ley 25.326 (base of licitud, minimización, plazo de supresión) | VERIFIED | "Data protection / Ley 25.326" paragraph added (minimal data, lawful treatment, 2-year retention) |
| C-23 | Data retention period declared | VERIFIED | 2 years post-deposit declared |
| C-24 | Bibliography: DOI resolves to correct article | PARTIAL | NIST SP 800-61 Rev. 2 incorporated (L43); Fanelle/Sokol reassignment and DOI fixes not verified |
| C-25 | Monitoring/dashboard demonstrated | PARTIAL | Paragraph on `docker compose logs` + manual inspection; n8n declared dashboard with Fig 5.15 as mockup; only hard monitor is log-reader `/report` (last-500 sample) |
| C-26 | Risks of simulated credentials | VERIFIED | Paragraph added per BITACORA |
| C-27 | Ley 25.326 / AAIP treatment | VERIFIED | Data-protection paragraph covers it |
| C-28 | License + data-sharing platforms (GitHub/HuggingFace/Zenodo) | PARTIAL | Paragraph claimed in BITACORA; README has NO MIT mention and no LICENSE file exists |
| A-22 | Tools 6→8 with licenses | VERIFIED | Paragraph added per BITACORA |
| A-15/A-16 | Encryption / memory exclusion (TSX) | VERIFIED | Paragraphs added per BITACORA |

**Conditional-clause check:** (a) dump with events/iocs/reports + real timestamps — **VERIFIED** (201,125/4,234/30/10,660 INSERTs, full period); (b) n8n execution records for declared period — **PARTIAL** (136 executions in n8n internal DB only: event-ingest 103 webhook on Aug 11 13:58–15:47, ioc-extractor 26 trigger Aug 11 14:00→Aug 12 20:00 + 4 cli, report-generator 3 cli only — the `0 8 * * *` cron has NEVER fired; nothing in repo as artifact; nothing for 13/07–10/08); (c) GitHub repo with 3 workflow JSONs + docker-compose + DDL — **NOT MET** (empty repo).

## Dataset Reconciliation (verified numbers)

- events: honeypot.db 201,125 = dump 201,125 = cowrie 157,234 + dionaea 43,891 ✓ (94,266 July timestamps in dump; range 2026-07-13T00:40:12-0300 → 2026-08-11T23:57:13-0300)
- iocs: 4,234 (ip 3,128 / domain 462 / url 284 / hash 147 / credential 124 / command 89; ALTO 1,482 / MEDIO 1,998 / BAJO 754) ✓
- reports: 30 (daily report-20260713…20260811.json, matching 30 INSERTs) ✓
- error_log: 10,660 (parsing 3,620 / enrichment 6,436 / schema 604) ✓
- sessions: proto_session 6,730 total / 4,310 confirmed / 3,978 with IOC (92.3%) ✓
- IPs: pais_temp 3,128 unique public; top China 976 IPs/62,776 events; top3 62.0% ✓
- KPIs: 94.7% structured; latency mean 297 ms (median 293, p95 604, p99 890, max 961.6, min 85.5 — kpis shows min −839.5, a negative-latency artifact to reconcile); peak 04:00 UTC-3 (28,050)
- Control test: session d7525579e2e2, 13 events, src 172.18.0.1, window 2026-08-11 12:45:36–12:47:47 UTC-3 (matches live Postgres 13/4/1/0)
- 11 maquetado CSVs (tabla_a01…a11) consistent with the above
- Secrets scan: no bot tokens / chat IDs / API keys in workflows, forwarder, compose, evidencia

## Gaps Summary

1. **C-20 / clause (c):** GitHub repo empty — publication is the single highest-leverage action (Etapa 0).
2. **Clause (b):** n8n execution records not exported to repo and don't cover the declared period; cron `0 8 * * *` never fired; no executions after Aug 12 20:00 (system was down until Aug 18 11:19).
3. **Thesis inconsistency:** Resumen = 13-event controlled test (Aug 10–11) vs §5.x/§6.x old 201,125-event/99%/16.6 h passages (L2056, 2226, 2427, 2664, 3368) — one number base must win (evidence supports 201,125).
4. **C-25 monitoring:** no real dashboard; only log-reader `/report` (sample-based) + docker logs.
5. **License:** no LICENSE file; README lacks the MIT mention BITACORA claims; no .github/ for provenance.
6. **Junk:** `_tmp300.sql`, `_tmp_kpis.py` at root; unrendered Mermaid diagrams; n8n editor without auth (security posture weakness to document or fix).
7. **Reconciliation detail:** kpis.json latency `min: -839.504` (negative) vs resumen `min: 85.496` — pick one canonical value in Etapa 1.

## Risks

- If the repo stays empty, Etapa 0 collapses into "rehacer la campaña de medición" — the audit explicitly says so.
- Thesis internal contradiction (13 events vs 201,125) is the likeliest attack surface for the tribunal; must be resolved before re-delivery.
- Execution-records gap cannot be backfilled for 13/07–10/08 — the honest fix is declaring the validation window (Aug 11) precisely and exporting what exists.
- n8n unauthenticated editor + live Telegram token in `.env` (gitignored) — keep out of the public repo; verify nothing secret is committed when pushing.

## Recommendation (direction for the proposal phase)

Propose change `revision-estructura-cumplimiento` implementing audit **Etapa 0 + 1**: (1) push the repo with a real commit and tag `Honeypot_Cowrie` (workflow JSONs, compose, DDL, README+LICENSE MIT, .env.example); (2) export n8n execution log evidence (IDs, timestamps, statuses for the 136 executions) into `evidencia/terminal de ejecuciones` style dated artifact; (3) reconcile the thesis: adopt ONE number base (honeypot.db/maquetados, per the director's decision), rewrite Resumen vs §5.x/§6.x 201,125 passages coherently (campaign 13/07–11/08, validation Aug 11 13 events clearly separated); (4) fix §5.13.1 node-count text, latency min discrepancy, Fig 5.15 already labeled maqueta (keep); (5) add LICENSE + .github provenance, remove root temp junk; (6) optionally secure n8n (basic auth) and document monitoring posture. Effort: Low–Medium; no system re-run required for the numbers; a day of stack uptime post-push can regenerate fresh cron execution evidence.

## Ready for Proposal

**Yes** — evidence base is complete and internally consistent; proposal should be scoped to Etapa 0+1 deliverables above, with verification via `git ls-remote` (tag/commit), file presence checks, and a number-vs-CSV reconciliation script.