# Repository Publication Specification

## Purpose

Publish the canonical repository (workflow JSONs, docker-compose.yml, db/schema.sql, README, LICENSE) to satisfy audit clause (c), without rewriting history or leaking secrets. The push to `github.com/lucasnorton01/Honeypot_Final_Nocturne_Society` is gated on explicit user authorization (decision D1).

## Requirements

### Requirement: R-01 — Linear history, no rewrite (MUST)

The repository MUST be initialized with `git init` on the existing working tree without deleting or rewriting any pre-existing `.git` data. History MUST stay linear: no `rebase`, `amend`, or `filter-branch` after the first commit.

**Verification:** `git rev-list --count --all` equals `git rev-list --count HEAD`; `git log --oneline` shows a single chain with one initial commit.

#### Scenario: Fresh init on working tree

- GIVEN the working tree with all project files and no `.git`
- WHEN `git init` runs and the initial commit is created
- THEN `git log --oneline` shows one linear chain and `git status` is clean

#### Scenario: Pre-existing partial `.git`

- GIVEN a `.git` directory from a prior partial init
- WHEN publication proceeds
- THEN existing history is preserved and extended, never rewritten

### Requirement: R-02 — Gitignore audit (MUST)

`.gitignore` MUST exclude `.env`, `evidencia/`, `n8n-data/`, `pg-data/`, `cowrie-var/`, and secret-shaped paths (`*token*`, `*secret*`, `*chat*`, `*.pem`). `.env.example` MUST be committed as the safe template.

**Verification:** `git check-ignore .env evidencia/` exits 0 for both; `git ls-files` contains `.env.example` and no `.env` or secret-shaped files.

#### Scenario: Token file added locally

- GIVEN `telegram_token.json` exists in the working tree
- WHEN the publish staging is checked
- THEN `git check-ignore` reports it ignored and it is absent from `git ls-files`

#### Scenario: `.env` must never be committed

- GIVEN a `.env` file with live Telegram credentials
- WHEN the initial commit is assembled
- THEN `.env` is ignored, while `.env.example` is present in the commit

### Requirement: R-03 — Pre-push secrets scan (MUST)

A scan (documented command or `scripts/scan_secrets.ps1`) MUST run against every file `git ls-files` would push, before each push. It MUST flag Telegram bot-token patterns, chat IDs, private-key blocks, and `sk-`/`AKIA` key shapes, exiting non-zero on any hit. The scan MUST NOT flag the honeypot decoy credential `admin:test123` in `cowrie/userdb.txt` (explicit allowlist).

**Verification:** scan exits 0 with zero hits on the full tree; a positive control (temporary file with a dummy token) exits non-zero.

#### Scenario: Clean scan gates the push

- GIVEN all files staged and the scan reports zero hits
- WHEN the scan exits 0
- THEN the push may proceed

#### Scenario: Secret detected blocks the push

- GIVEN a file containing a Telegram bot token shaped string
- WHEN the scan runs
- THEN it exits non-zero and the push MUST NOT proceed until the file is removed or ignored

### Requirement: R-04 — Commit, tag, gated push (MUST)

The initial commit MUST include the full tree (excluding ignored paths). An annotated tag `Honeypot_Cowrie` MUST exist. The push MUST NOT occur without explicit user authorization (D1); without it, commit and tag remain local-only and BITACORA records the push as deferred.

**Verification:** `git tag -l` shows `Honeypot_Cowrie`; `git log -1 --format=%H` resolves; after an authorized push, `git ls-remote origin` shows the commit and the tag.

#### Scenario: User authorizes push

- GIVEN the tag and commit exist and the user explicitly authorizes the push
- WHEN the push runs
- THEN `git ls-remote origin` lists the commit and `Honeypot_Cowrie`

#### Scenario: Push not yet authorized

- GIVEN no explicit user authorization
- WHEN the publication phase ends
- THEN commit and tag exist locally only, and BITACORA documents the deferred push
