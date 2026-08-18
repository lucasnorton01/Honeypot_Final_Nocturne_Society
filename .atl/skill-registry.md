# Skill Registry

Index of available LLM-first skills by trigger and path. Subagents read the full `SKILL.md` at the listed path; this file is an index, not a summary.

Generated: 2026-08-18 by `sdd-init` (persistence: `openspec` mode, Engram unavailable).

## Scope Notes

- **Project skills**: none detected (no `skills/`, `.opencode/skills/`, `.claude/skills/`, `.gemini/skills/`, `.cursor/skills/`, `.github/skills/`, `.codex/skills/`, `.qwen/skills/`, `.kiro/skills/`, `.openclaw/skills/`, `.pi/skills/`, `.agent/skills/`, `.agents/skills/`, or `.atl/skills/` directories in project root).
- **User skills**: `~/.config/opencode/skills/` (Windows: `C:\Users\Lucas Norton\.config\opencode\skills\`).
- SDD pipeline skills (`sdd-*`), `_shared`, and `skill-registry` are excluded from this index by scan rules.
- This project is NOT a git repository; PR/review/issue skills apply only if the repo is later initialized.

## User Skills

| Name | Trigger (from description) | Path |
| ---- | -------------------------- | ---- |
| branch-pr | Creating, opening, or preparing PRs for review | `C:\Users\Lucas Norton\.config\opencode\skills\branch-pr\SKILL.md` |
| chained-pr | PRs over 400 lines, stacked PRs, review slices | `C:\Users\Lucas Norton\.config\opencode\skills\chained-pr\SKILL.md` |
| cognitive-doc-design | Writing guides, READMEs, RFCs, onboarding, architecture, or review-facing docs | `C:\Users\Lucas Norton\.config\opencode\skills\cognitive-doc-design\SKILL.md` |
| comment-writer | PR feedback, issue replies, reviews, Slack messages, or GitHub comments | `C:\Users\Lucas Norton\.config\opencode\skills\comment-writer\SKILL.md` |
| gentle-ai-bench | bench, journey, journeys, driven mode, gentle-ai-bench, journey corpus, j-numbers, bench axis | `C:\Users\Lucas Norton\.config\opencode\skills\gentle-ai-bench\SKILL.md` |
| go-testing | Go tests, go test coverage, Bubbletea teatest, golden files | `C:\Users\Lucas Norton\.config\opencode\skills\go-testing\SKILL.md` |
| issue-creation | Issue creation, bug reports, feature requests, or issue approval | `C:\Users\Lucas Norton\.config\opencode\skills\issue-creation\SKILL.md` |
| judgment-day | judgment day, dual review, adversarial review, juzgar | `C:\Users\Lucas Norton\.config\opencode\skills\judgment-day\SKILL.md` |
| rdd-defect-workflow | RDD, receipt-driven development, review authority, receipt/lineage, correction/recovery, delivery gate/kill switch, bounded review defects | `C:\Users\Lucas Norton\.config\opencode\skills\rdd-defect-workflow\SKILL.md` |
| skill-creator | New skills, agent instructions, documenting AI usage patterns | `C:\Users\Lucas Norton\.config\opencode\skills\skill-creator\SKILL.md` |
| skill-improver | Improve skills, audit skills, refactor skills, skill quality | `C:\Users\Lucas Norton\.config\opencode\skills\skill-improver\SKILL.md` |
| systemic-issue-triage | New issue, bug report, triage, backlog, issue flood, community report, root cause, dead-end, blocked user | `C:\Users\Lucas Norton\.config\opencode\skills\systemic-issue-triage\SKILL.md` |
| work-unit-commits | Implementation, commit splitting, chained PRs, or keeping tests and docs with code | `C:\Users\Lucas Norton\.config\opencode\skills\work-unit-commits\SKILL.md` |

## Convention Files

None detected in project root (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `GEMINI.md`, `copilot-instructions.md` not present). Project conventions live in Spanish markdown docs: `README.md`, `BITACORA.md`, `ESPECIFICACIONES.md`.
