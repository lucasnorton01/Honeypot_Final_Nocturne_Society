# Proposal: Revision of structure and audit compliance (Etapas 0/1)

## Intent

Satisfy audit clause (a/b/c) so 20/28 findings flip from "no verificable" to "corregible por reconciliación", and leave the repo professional before re-delivery. No re-run needed: the 201,125-event corpus is internally consistent across artifacts.

## Context

Audit ~5.4: (a) dump VERIFIED; (b) n8n executions PARTIAL (136, internal only; cron never fired); (c) GitHub repo NOT MET (empty). Thesis self-contradicts (Resumen 13 vs §5/§6 201,125). Director's rule: honeypot.db + tablas/*.csv are the only Chapter-5 sources.

## Scope

### In Scope
- **Etapa 0 — Publish:** git init, pre-push secrets scan, initial commit, tag `Honeypot_Cowrie`, push to `lucasnorton01/Honeypot_Final_Nocturne_Society` (only after user authorization, D1).
- **Etapa 1 — Evidence:** export 136 n8n executions (IDs/dates/statuses) to `evidencia/` dated artifact; honestly state cron never fired + declare validation window (Aug 11); document monitoring.
- **Etapa 2 — Reconciliation:** single base = 201,125; fix Resumen vs §5/§6 (L2056/2226/2427/2664/3368), §5.13.1 node count, kpis.json latency min (adopt resumen 85.496, annotate).
- **Etapa 3 — Hygiene + verify:** LICENSE (MIT), README license mention, `.github/`; delete `_tmp300.sql`, `_tmp_kpis.py`, `scripts/_test_parse.py`; final audit pass → 0 NOT MET.

### Out of Scope
Pipeline redesign; new campaign; test framework (follow-up); exposing honeypot; fabricating evidence; rendering Mermaid figures (document-only); n8n hardening (D4).

## Business / Product Implications

- Defense: clause + honest records remove the tribunal's likeliest attack surface; C-20: an empty repo collapses this into "rehacer la campaña".
- Public repo carries zero secrets (Telegram token stays in gitignored `.env`).

## Edge Cases

- 13/07–10/08 logs cannot be backfilled ⇒ never fabricate; declare window (Aug 11).
- Cron never fired ⇒ fix + uptime day, or document the schedule honestly.
- Thesis divergence ⇒ confirm before touching `tesis-extendida.md` (D3).
- Post-push secrets are unrecoverable ⇒ pre-commit scan.

## Approach (staged)

Etapa 0 → 1 → 2 → 3, each ending in a commit; junk deletion post initial commit (git-reversible).

## Impact

| Area | Impact | Description |
|------|--------|-------------|
| `_tmp300.sql`, `_tmp_kpis.py`, `scripts/_test_parse.py` | Removed | Junk cleanup |
| `LICENSE` (new), `README.md` | Modified | MIT + mention |
| `evidencia/` | Modified | n8n execution export |
| `tesis-extendida.md` | Modified* | Number-base fix (*D3) |
| `.github/` (new), `.gitignore` | Modified | Provenance + hygiene |
| `analitica/kpis.json` | Modified | Canonical latency min |
| `n8n/workflows/*.json`, `docker-compose.yml`, `db/schema.sql` | Unchanged | Published as-is (clause c) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Secret leaked to public repo | Med | Pre-push scan + gitignore audit |
| Evidence fabrication temptation | Med | Honest window declaration; no backfill |
| Downtime blocks cron re-validation | Med | Document window; opportunistic re-check |
| Thesis drift after edit | Low | Reconciliation script + user review |
| Push blocked (auth) | Med | Local commit/tag already satisfies clause partially |

## Rollback Plan

- Repo: unpublish remote or force-push revert.
- Evidence/thesis: git revert stage commit.
- Junk: `git checkout -- <path>` (committed pre-deletion).

## Dependencies

User GitHub authorization; stack uptime for fresh cron evidence.

## Success Criteria

- [ ] `git ls-remote` shows commit + tag `Honeypot_Cowrie` (or local tag, push authorized).
- [ ] n8n execution export in `evidencia/`, 136 executions, dated.
- [ ] Script proves every Cap. V number ↔ honeypot.db/tablas (201,125 base).
- [ ] LICENSE (MIT) + README mention; junk files gone.
- [ ] Audit re-check: 0 NOT MET.

## Capabilities

### New Capabilities
- `repository-publication`: git init/commit/tag/push, pre-push secrets scan.
- `evidence-export`: n8n executions → dated `evidencia/` artifact; honest cron/window docs.
- `narrative-reconciliation`: single 201,125 base across thesis; canonical kpis.json values.
- `repository-hygiene`: LICENSE/README/.github, junk removal.

### Modified Capabilities
None (`openspec/specs/` empty).

## Open Decisions

1. Push now or defer (needs credentials)?
2. Confirm tag `Honeypot_Cowrie`.
3. SDD edits `tesis-extendida.md`, or user edits with guidance?
4. n8n basic auth in scope, or document-only?

Minimum viable before specs: D1 + D3.