# Repository Hygiene Specification

## Purpose

Leave the repo professional before re-delivery: MIT license, provenance directory, rollback-safe junk removal, and the final audit re-check proving every in-scope PARTIAL/NOT MET finding flipped to VERIFIED.

## Requirements

### Requirement: R-12 — License and provenance (MUST)

A root `LICENSE` MUST contain the MIT text with a 2026 Nocturne Society (Crespo, Norton, Santos) copyright line. `README.md` MUST mention the MIT license and the canonical repository URL. A `.github/` directory MUST exist with at least one provenance file (e.g., SECURITY.md) stating lab purpose, data-protection posture, and the validation window.

**Verification:** Test-Path `LICENSE` and `.github`; grep LICENSE for "MIT License" and "2026"; grep README.md for "MIT" and the repo URL; `.github` directory listing is non-empty.

#### Scenario: README claim without LICENSE file

- GIVEN README claims MIT but no LICENSE exists (today's C-28 gap)
- WHEN the hygiene pass runs
- THEN acceptance fails until the LICENSE file is created

### Requirement: R-13 — Junk removal, rollback-safe (MUST)

`_tmp300.sql`, `_tmp_kpis.py` (root) and `scripts/_test_parse.py` MUST be deleted in a dedicated commit created AFTER the initial commit, so the files remain recoverable from git history.

**Verification:** Test-Path on all three is false; `git log --diff-filter=D --name-only` lists exactly those three files in the deletion commit; `git show <deletion-commit>^:_tmp300.sql` still outputs content.

#### Scenario: Deletion after initial commit

- GIVEN the initial commit already contains the junk files
- WHEN the cleanup commit deletes them
- THEN the files are absent from the tree and recoverable via `git checkout <initial-commit> -- <path>`

#### Scenario: Rollback executed

- GIVEN a need to restore a deleted temp file
- WHEN `git checkout <initial-commit> -- _tmp300.sql` runs
- THEN Test-Path `_tmp300.sql` is true again

### Requirement: R-14 — Final audit re-check (MUST)

The change MUST produce an audit re-check artifact (BITACORA section or `docs/verificacion-auditoria.md`) with the full audit table. Every in-scope item previously PARTIAL/NOT MET (C-01, C-02, C-03, C-04, C-11, C-15, C-17, C-20, C-25, C-28, clause b) MUST be marked VERIFIED with the reproduced evidence command and its output. Out-of-scope items (C-07…C-10 figures, C-18, C-19, C-24) MUST be listed out-of-scope with reasons. Success = 0 NOT MET and 0 PARTIAL within scope.

**Verification:** the re-check artifact exists; each in-scope ID has status VERIFIED, an exact command, and output; every command is rerunnable.

#### Scenario: In-scope item still PARTIAL

- GIVEN an in-scope ID not yet VERIFIED when the re-check runs
- WHEN the final pass completes
- THEN the change is incomplete; the re-check table records the gap and apply resumes

#### Scenario: Full flip achieved

- GIVEN all in-scope items VERIFIED with reproduced commands
- WHEN the re-check artifact is written
- THEN the change meets the audit success criterion (0 NOT MET in scope) and is ready for review
