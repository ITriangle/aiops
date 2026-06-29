# aiops

[English](README.en.md)

面向 AI 辅助软件开发的 agent skills bundle —— 一条 `/aiops` 命令带你对齐、实现、交付，全程硬质量门控。安装一次，跨 **6 个 AI IDE** 使用。

入口：`**/aiops**`（Flow Conductor — 中文步骤引导，进度可恢复）

## 核心特性

- **一条命令开工** — 用中文描述目标即可；进度写在 `.scratch/<功能名>/flow.state.yaml`，`/aiops 继续` 接着做
- **20 个 skills** — 对齐 → 设计评审 → 规划 → 交付 → 评审 → 发布
- **9 个专业 agents** — 制品契约与调度序列（普通用户不必记名字）
- **零配置默认** — 无 `aiops.yaml` 时用本地 markdown 记任务；团队可配置 GitHub/GitLab
- **始终生效的 lean 纪律** — YAGNI ladder 自动注入编码 turn（Cursor / Copilot / Windsurf rules）
- **多 IDE 可移植** — `SKILL.md` 单一来源，adapter 编译为各 IDE 原生格式

## 快速开始

```bash
# 安装到所有检测到的 AI IDE（项目级，默认）
npx -y github:yugasun/aiops

# 或通过 curl
curl -fsSL https://raw.githubusercontent.com/yugasun/aiops/main/install.sh | bash
```

在目标项目聊天框输入：

```
/aiops 我想加一个健康检查接口
```

隔天继续：

```
/aiops 继续
```

### CLI 选项

```bash
# 指定 IDE
npx -y github:yugasun/aiops --ide cursor
npx -y github:yugasun/aiops --ide claude
npx -y github:yugasun/aiops --ide codex
npx -y github:yugasun/aiops --ide copilot
npx -y github:yugasun/aiops --ide windsurf

# 全局安装（到 ~/）
npx -y github:yugasun/aiops -g

# 选择性安装
npx -y github:yugasun/aiops --skills-only     # 仅 skills
npx -y github:yugasun/aiops --agents-only     # 仅 agents

# 查看检测到的 IDE（不安装）
npx -y github:yugasun/aiops --list

# 卸载
npx -y github:yugasun/aiops --uninstall
```

### Claude Code 插件（备选）

```
/plugin marketplace add yugasun/aiops
/plugin install aiops@aiops
```

插件命令带 `aiops:` 前缀（如 `/aiops:aiops`）；Skills CLI 安装则直接用 `/aiops`。

## 支持的 IDE


| IDE                | Skills 路径           | Always-On                         | Agents                  | Hooks                        |
| ------------------ | ------------------- | --------------------------------- | ----------------------- | ---------------------------- |
| **Claude Code**    | `.claude/skills/`   | 通过 `/lean` 触发                     | `.claude/agents/*.md`   | SessionStart + SubagentStart |
| **Cursor**         | `.cursor/skills/`   | `.cursor/rules/lean.mdc`          | `.cursor/agents/*.md`   | —                            |
| **Codex CLI**      | `.agents/skills/`   | 通过 `AGENTS.md`                    | `.codex/agents/*.toml`  | —                            |
| **Windsurf**       | `.windsurf/skills/` | `.windsurf/rules/lean.mdc`        | `.windsurf/agents/*.md` | —                            |
| **GitHub Copilot** | `.github/skills/`   | `.github/copilot-instructions.md` | `.github/agents/*.md`   | —                            |
| **通用 harness**     | —                   | `AGENTS.md`（项目根目录）                | —                       | —                            |


## 功能清单

### Skills（20 个 Tier 1）


| 层      | Skills                                                                |
| ------ | --------------------------------------------------------------------- |
| **路由** | `/aiops` — Flow Conductor，推断场景并分步引导                                   |
| **设置** | `/aiops-setup` — issue 跟踪、triage 标签、领域文档                              |
| **对齐** | `/grill-with-docs`、`/grilling`、`/domain-modeling`、`/architect-design` |
| **规划** | `/to-prd`、`/to-issues`、`/handoff`、`/prototype`                        |
| **交付** | `/aiops-implement` → `/lean` → `/tdd` → `/prune` → `/review`          |
| **架构** | `/improve-codebase-architecture` — 扫描深化机会                             |
| **其他** | `/diagnosing-bugs`、`/triage`、`/ui-mockup`、`/gitops`                   |


完整列表：[`skills/manifest.json`](skills/manifest.json)

### Agents（9 个）


| Agent             | 角色          | 核心输出                     |
| ----------------- | ----------- | ------------------------ |
| `architect`       | 设计决策 + 技术规格 | NOTES.md, tech-spec.md   |
| `design-reviewer` | 设计评审门控      | DESIGN_REVIEW.md         |
| `planner`         | 任务拆解 + 计划   | PRD.md, plan.md, issues/ |
| `prototyper`      | 快速验证        | VERDICT.md, prototype/   |
| `builder`         | TDD 实现      | 源码 + 测试                  |
| `ui-designer`     | HTML 原型     | mockups/                 |
| `code-reviewer`   | 代码评审        | REVIEW.md                |
| `quality-auditor` | YAGNI 审计    | prune 发现                 |
| `gitops`          | Git 操作      | commit + push            |


### Lean 纪律（始终生效）

YAGNI ladder 在支持的 IDE 中自动注入每次编码 turn：

```
1. 这真的需要存在吗？(YAGNI)
2. 标准库能做吗？
3. 平台原生特性？
4. 已安装的依赖？
5. 一行代码？
6. 能工作的最少代码
```

交付序列：**lean → TDD → prune → review → commit**（仅在用户明确要求后提交）。

## 在目标项目中使用

1. 打开项目，直接 `/aiops …` — 首次会自动静默配置（本地 markdown issue + 默认标签）
2. 团队用 GitHub/GitLab 时，在项目根添加 `aiops.yaml`（见 `skills/aiops-setup/aiops.yaml.example`）
3. 大任务默认单次会话；多模块时可拆 PRD + 多个 issue

详情：[**docs/getting-started.zh-CN.md**](docs/getting-started.zh-CN.md)（[English](docs/getting-started.md)）

## 架构

```
                    ┌─── 构建脚本 ────→ .cursor/rules/lean.mdc
                    │                   .github/copilot-instructions.md
                    │                   .windsurf/rules/lean.mdc
                    │                   AGENTS.md
                    │
skills/lean/SKILL.md ─── 安装时 ────→ Cursor / Copilot / Windsurf: always-on rules
                    │                  Claude / Codex: skills 目录
                    │
                    └─── hooks ──────→ SessionStart / SubagentStart
```

**Adapter seam**（`scripts/adapters/`）在安装时将 `SKILL.md` 转为 IDE 原生格式。

```bash
node scripts/build/build-all.js    # 维护者：生成所有 IDE 原生制品
```

## 文档

- [快速开始](docs/getting-started.zh-CN.md)
- [Agent 注册表](docs/agent-registry.md)
- [Skill 注册表](docs/skill-registry.md)
- [项目网站](website/index.html) — 交互示例与 use cases

## 许可证

Apache 2.0 — 见 [LICENSE](LICENSE)。贡献指南：[CONTRIBUTING.md](CONTRIBUTING.md)。