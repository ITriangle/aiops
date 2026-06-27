# Agent Registry

Single reference for agents in the aiops bundle — their roles, skills, and artifact contracts.

## What is an Agent?

Agents are specialized identities that wrap skills. **Skills are verbs** (what to do), **agents are nouns** (who does it, with what perspective and constraints).

The Router (`/aiops`) dispatches agents based on task type. Users can also invoke agents directly:

```
/aiops <task description>              # auto-dispatch
/aiops architect <task description>    # direct invocation
```

## All Agents

From [`skills/manifest.json`](../skills/manifest.json) `agents` array:

| Agent | Role | Skills | Key Outputs |
|-------|------|--------|-------------|
| `architect` | alignment | grilling, grill-with-docs, domain-modeling, architect-design, improve-codebase-architecture | NOTES.md, tech-spec.md |
| `design-reviewer` | design-gate | review | DESIGN_REVIEW.md |
| `planner` | planning | to-prd, to-issues, handoff, aiops-setup | PRD.md, plan.md, issues/ |
| `prototyper` | prototype | prototype, lean | VERDICT.md, prototype/ |
| `builder` | delivery | aiops-implement, tdd, lean | source code + tests |
| `ui-designer` | design | ui-mockup | mockups/, design-notes.md |
| `code-reviewer` | delivery-gate | review | REVIEW.md |
| `quality-auditor` | delivery-gate | prune | prune findings |
| `gitops` | delivery | gitops | commit + push |

## Agent definitions

Each agent is defined in `agents/<name>.md`:

| File | Agent |
|------|-------|
| `agents/architect.md` | Architect |
| `agents/design-reviewer.md` | Design Reviewer |
| `agents/planner.md` | Planner |
| `agents/prototyper.md` | Prototyper |
| `agents/builder.md` | Builder |
| `agents/ui-designer.md` | UI Designer |
| `agents/code-reviewer.md` | Code Reviewer |
| `agents/quality-auditor.md` | Quality Auditor |
| `agents/gitops.md` | Gitops |

## Dispatch sequences

| Task type | Agent sequence |
|-----------|---------------|
| **Feature** | architect → design-reviewer → planner → builder → code-reviewer → quality-auditor → gitops |
| **Feature + UI** | architect → ui-designer → design-reviewer → planner → builder → code-reviewer → quality-auditor → gitops |
| **Bug** | builder → code-reviewer → gitops |
| **Incoming** | router triage → builder → code-reviewer → gitops |
| **Prototype** | prototyper (standalone, no delivery chain) |
| **Architecture health** | architect → design-reviewer → planner → builder → code-reviewer → quality-auditor → gitops |

## Artifact contracts

Agents communicate through `.scratch/<feature>/` files:

| Artifact | Producer | Consumers |
|----------|----------|-----------|
| `NOTES.md` | architect | design-reviewer, planner, builder, code-reviewer |
| `tech-spec.md` | architect | design-reviewer, planner, builder, code-reviewer |
| `DESIGN_REVIEW.md` | design-reviewer | planner, architect (REQUEST_CHANGES) |
| `PRD.md` | planner | builder |
| `plan.md` | planner | builder |
| `issues/*.md` | planner | builder |
| `VERDICT.md` | prototyper | architect, builder |
| `mockups/` | ui-designer | builder, code-reviewer |
| `REVIEW.md` | code-reviewer | builder, quality-auditor, gitops |
| prune findings | quality-auditor | builder |

Full artifact formats: see [design spec](superpowers/specs/2026-06-26-agents-team-design.md).
