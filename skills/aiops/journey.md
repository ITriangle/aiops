# Journey state — `flow.state.yaml`

Resumable progress for `/aiops` Flow Conductor. Path: `.scratch/<slug>/flow.state.yaml`.

## When to read / write

- **Start** `/aiops` (or resume): read if exists; else infer `FlowState` from user message + repo, run `plan_flow`, write initial state.
- **End each phase**: update `current_phase_id`, append `phases_done`, record `gates_satisfied` when gate artifacts exist.
- **Handoff** (`/handoff`): update journey **before** writing temp handoff doc.

Maintainers: canonical phase list from `python3 scripts/lib/flow_cli.py` (this repo only).

## Schema (version 1)

```yaml
version: 1
slug: login
task_kind: feature_idea  # feature_idea | feature_with_ui | bug_fix | incoming_queue | architecture_health | new_personal_skill | prototype
delivery_mode: single_session  # single_session | multi_session
user_description: "做一个用户登录功能"
current_phase_id: alignment
phases_done: []
gates_satisfied: []  # e.g. design_review_approve, review_approve
current_issue: null  # e.g. issues/001-add-auth.md when multi-session
delivery_sub_phase: null  # implement | prune | review | ready_for_commit — only during delivery phase
```

## Gate names (append to `gates_satisfied`)

| Gate | Artifact check |
| --- | --- |
| `bootstrap_done` | `docs/agents/` exists |
| `design_review_approve` | `DESIGN_REVIEW.md` contains APPROVE |
| `prototype_verdict` | `VERDICT.md` exists when prototype ran |
| `prune_done` | prune findings recorded or "Lean already" |
| `review_approve` | `REVIEW.md` contains APPROVE |
| `ready_for_commit` | all delivery sub-phases complete |

## Resume

User says「继续」「resume」「上次」→ read `flow.state.yaml`, load agent from current phase, show narration for `current_phase_id` without re-asking task type.

## FlowState inference (new journey)

| Signal | Flag |
| --- | --- |
| Empty / no src | `has_codebase: false` → `/grilling` |
| Bug / 报错 / regression | `task_kind: bug_fix` |
| 优化架构 / 技术债 / refactor codebase | `task_kind: architecture_health` |
| 待办 / triage / issue #N | `task_kind: incoming_queue` |
| 界面 / UI / 页面 | `task_kind: feature_with_ui` |
| User confirms multi / 多会话 / AFK per issue | `delivery_mode: multi_session` |
| **Default** | `delivery_mode: single_session` |
| No `docs/agents/` | `issue_tracker_configured: false` → bootstrap phase |
| `aiops.yaml` with `issue_tracker.kind` github or gitlab | bootstrap seeds remote tracker (see `skills/aiops-setup/aiops-yaml.md`) |
| No `aiops.yaml` | bootstrap uses local markdown + 1:1 labels silently |
