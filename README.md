# aiops

[中文文档](README.zh-CN.md)

Type `/aiops` in your AI IDE and describe the work you want done. aiops guides the task from clarification to implementation, review, and final approval, with resumable progress across **6 AI IDEs**.

Entry: `**/aiops**` (guided workflow, resumable via `flow.state.yaml`).

## What it helps you do

- **Start from the task** — describe a feature, bug, or refactor in natural language
- **Follow a guided flow** — aiops asks for missing decisions, shows the current step, and saves progress
- **Keep AI changes small** — lean discipline, TDD, prune, and review run before delivery
- **Resume later** — continue from `.scratch/<feature>/flow.state.yaml` with `/aiops continue`
- **Stay in control** — commits only happen after you explicitly approve them
- **Go deeper when needed** — optional agents, skills, and code graph tooling support larger work

## Quick start

```bash
npx -y github:yugasun/aiops
```

In your project chat:

```
/aiops Add a health check endpoint
```

Resume later:

```
/aiops continue
```

## What happens next

For a small feature, aiops usually runs:

1. Clarify scope and acceptance criteria
2. Agree the design before coding
3. Write tests first
4. Implement the smallest working change
5. Prune excess code and review the diff
6. Wait for your approval before commit

Bug reports skip the alignment ceremony and go straight to diagnosis. Larger features can be turned into a PRD and vertical-slice issues before implementation.

### Code Graph (optional enhancement)

Architecture scans can use `/code-graph` for structured code understanding with [graphify](https://github.com/safishamsi/graphify): Tree-sitter AST parsing plus Louvain community detection. This is optional; the core aiops flow works without extra Python tooling.

Install it only when you want stronger architecture and impact analysis:

```bash
uv tool install graphifyy
graphify --version
```

If you do not use uv, `pip install graphifyy` or `pipx install graphifyy` also works.

### CLI options

```bash
npx -y github:yugasun/aiops --ide cursor
npx -y github:yugasun/aiops -g
npx -y github:yugasun/aiops --skills-only
npx -y github:yugasun/aiops --agents-only
npx -y github:yugasun/aiops --list
npx -y github:yugasun/aiops --uninstall
```

### Claude Code Plugin (alternate)

```
/plugin marketplace add yugasun/aiops
/plugin install aiops@aiops
```

## Supported IDEs


| IDE                 | Skills Path         | Always-On                         | Agents                  | Hooks                        |
| ------------------- | ------------------- | --------------------------------- | ----------------------- | ---------------------------- |
| **Claude Code**     | `.claude/skills/`   | via `/lean`                       | `.claude/agents/*.md`   | SessionStart + SubagentStart |
| **Cursor**          | `.cursor/skills/`   | `.cursor/rules/lean.mdc`          | `.cursor/agents/*.md`   | —                            |
| **Codex CLI**       | `.agents/skills/`   | via `AGENTS.md`                   | `.codex/agents/*.toml`  | —                            |
| **Windsurf**        | `.windsurf/skills/` | `.windsurf/rules/lean.mdc`        | `.windsurf/agents/*.md` | —                            |
| **GitHub Copilot**  | `.github/skills/`   | `.github/copilot-instructions.md` | `.github/agents/*.md`   | —                            |
| **Generic harness** | —                   | `AGENTS.md`                       | —                       | —                            |


## Under the hood

You do not need to memorize these to use aiops. They are documented for teams that want to inspect or customize the workflow.

### Skills


| Layer            | Skills                                                                   |
| ---------------- | ------------------------------------------------------------------------ |
| **Router**       | `/aiops` — Flow Conductor                                                |
| **Setup**        | `/aiops-setup`                                                           |
| **Alignment**    | `/explore`, `/grill-with-docs`, `/grilling`, `/domain-modeling`, `/architect-design` |
| **Planning**     | `/to-prd`, `/to-issues`, `/handoff`, `/prototype`                        |
| **Delivery**     | `/aiops-implement` → `/lean` → `/tdd` → `/prune` → `/review`             |
| **Architecture** | `/improve-codebase-architecture` — multi-modal sweep + deepening         |
| **Infrastructure** | `/code-graph` — graphify code graph for all skills to query            |
| **Other**        | `/diagnosing-bugs`, `/triage`, `/ui-mockup`, `/gitops`                   |


Full list: [`skills/manifest.json`](skills/manifest.json)

### Agents (9)


| Agent             | Role               | Key Output               |
| ----------------- | ------------------ | ------------------------ |
| `architect`       | Design + tech-spec | NOTES.md, tech-spec.md   |
| `design-reviewer` | Design gate        | DESIGN_REVIEW.md         |
| `planner`         | Breakdown + plan   | PRD.md, plan.md, issues/ |
| `prototyper`      | Rapid validation   | VERDICT.md, prototype/   |
| `builder`         | TDD implementation | source + tests           |
| `ui-designer`     | HTML mockups       | mockups/                 |
| `code-reviewer`   | Code review        | REVIEW.md                |
| `quality-auditor` | YAGNI check        | prune findings           |
| `gitops`          | Git ops            | commit + push            |


### Delivery discipline

Delivery sequence: **lean → TDD → prune → review → commit**. The final commit runs only when you explicitly approve it.

## In a target project

1. Open the project in your AI IDE and run `/aiops <task>`
2. Follow the prompted steps; aiops saves progress automatically
3. Resume with `/aiops continue` whenever you come back
4. Add `aiops.yaml` only if your team wants GitHub/GitLab issue tracking

Details: [**docs/getting-started.md**](docs/getting-started.md)

## Docs

- [Getting started](docs/getting-started.md)
- [Agent registry](docs/agent-registry.md)
- [Skill registry](docs/skill-registry.md)
- [Website](website/index.html)

## Demo walkthroughs

> Real run logs based on [aiops-demo](https://github.com/yugasun/aiops-demo). [Full index →](docs/demos/)

- [Health check walkthrough](docs/demos/health-check-walkthrough.md) — a small API feature through clarification, TDD, review, and approval
- [Architecture scan + code graph](docs/demos/architecture-scan-walkthrough.md) — evidence-backed architecture scan, then one chosen refactor
- [Effect analysis](docs/demos/effect-analysis.md) — direct AI coding compared with the guided aiops flow
- [Automated benchmark](docs/demos/benchmark.sh) — `bash docs/demos/benchmark.sh` runs the comparison

## License

Apache 2.0 — see [LICENSE](LICENSE). Contributing: [CONTRIBUTING.md](CONTRIBUTING.md).
