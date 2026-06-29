# aiops.yaml — project config (optional)

Place at **repo root**. Read during conductor **bootstrap** and explicit `/aiops-setup`.

## Rule

| `docs/agents/` | `aiops.yaml` | Bootstrap behavior |
| --- | --- | --- |
| missing | absent | **Silent defaults** — local markdown issues + 1:1 triage labels; no tracker questionnaire |
| missing | present | Apply `issue_tracker` from yaml (GitHub/GitLab only when yaml says so) |
| exists | any | Skip bootstrap; edit `docs/agents/*.md` to change tracker |

## Schema (version 1)

```yaml
version: 1

issue_tracker:
  kind: local          # local | github | gitlab — default local when file absent
  prs_as_triage: false # github | gitlab only — external PRs as triage surface

# Optional — default 1:1 canonical role names when omitted
triage_labels:
  needs-triage: needs-triage
  needs-info: needs-info
  ready-for-agent: ready-for-agent
  ready-for-human: ready-for-human
  wontfix: wontfix

# Optional — default single when omitted
domain:
  layout: single       # single → CONTEXT.md + docs/adr/ | multi → CONTEXT-MAP.md
```

## Writes

Bootstrap always creates `docs/agents/issue-tracker.md`, `triage-labels.md`, `domain.md` from templates in `skills/aiops-setup/`:

| `issue_tracker.kind` | Template seed |
| --- | --- |
| `local` | `issue-tracker-local.md` |
| `github` | `issue-tracker-github.md` |
| `gitlab` | `issue-tracker-gitlab.md` |

Set `prs_as_triage` in `issue-tracker.md` body when yaml says `true`.

## Example — GitHub team repo

```yaml
version: 1
issue_tracker:
  kind: github
  prs_as_triage: false
```

## Example — stay on defaults (no file needed)

No `aiops.yaml` → local markdown under `.scratch/<feature>/` — zero config.
