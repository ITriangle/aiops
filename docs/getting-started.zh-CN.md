# 快速开始

面向在**目标项目**（你的应用仓库，不是 aiops 本仓库）里使用 bundle 的用户。

[English](getting-started.en.md)

## 前置条件

- Node.js 18+
- Cursor、Claude Code、Codex、Copilot、Windsurf 等 [支持的 Agent](https://github.com/vercel-labs/skills#supported-agents)
- 一个你想用 AI 辅助开发的代码库

## 1. 安装 bundle

### 推荐：npx 安装到当前项目

```bash
npx -y github:yugasun/aiops
```

安装到指定 IDE 或全局：

```bash
npx -y github:yugasun/aiops --ide cursor
npx -y github:yugasun/aiops -g
npx -y github:yugasun/aiops --list      # 只看检测到的 IDE
```

或通过 curl：

```bash
curl -fsSL https://raw.githubusercontent.com/yugasun/aiops/main/install.sh | bash
```

### 备选：Skills CLI

```bash
npx skills@latest add yugasun/aiops -g -y --skill '*'
npx skills@latest add yugasun/aiops --list
```

### 备选：Claude Code 插件

```
/plugin marketplace add yugasun/aiops
/plugin install aiops@aiops
```

插件命令带 `aiops:` 前缀（如 `/aiops:aiops`）；npx / Skills CLI 安装直接用 `/aiops`。

**装完重启 IDE。**

## 2. 在目标项目里开聊（通常不用先 setup）

打开你的**应用仓库**，在聊天框输入：

```
/aiops 加一个 health 接口，返回 status 和版本号
```

首次使用且没有 `docs/agents/` 时，**Flow Conductor 会自动静默配置**（默认本地 markdown 记任务 + 默认 triage 标签），**不必先跑** `/aiops-setup`。

只有团队要用 GitHub/GitLab 管 issue 时，在项目根加 `aiops.yaml`（见 `skills/aiops-setup/aiops.yaml.example`）。

显式完整配置（换 tracker、改标签）仍可运行：

```
/aiops-setup
```

## 3. 示例：健康检查接口

**场景：** 小 HTTP 服务，加 `GET /health` 返回 `{ "status": "ok", "version": "<semver>" }`，不过度工程。

### 3.1 开始

```
/aiops 加一个 health 接口，返回 status 和版本号
```

Conductor 会显示 **第 N/M 步**（中文），进度写在 `.scratch/<slug>/flow.state.yaml`。隔天：

```
/aiops 继续
```

典型路径：对齐 → 设计 → 设计评审 → 实现（含质量门）→ 你确认后提交。

专家可直接指定 agent：

```
/aiops architect 设计缓存层
/aiops builder 实现 issue 001
/aiops gitops 提交代码
```

### 3.2 交付模式

**默认单次会话**（小改动一次聊完）。只有多模块、多切片等大功能时，Conductor 会建议拆 PRD + 多个 issue，每个 issue 新开聊天。

### 3.3 实现阶段质量门（`/aiops-implement` 内）

| 顺序 | 做什么 |
| --- | --- |
| 1 | 最小代码（lean ladder） |
| 2 | TDD 测试 |
| 3 | 精简 diff（prune） |
| 4 | 对照设计评审（review） |
| 5 | **只有你明确要求才 commit** |

### 3.4 预期结果

- `GET /health` 返回 `status` + `version`
- 一条穿过真实 HTTP 栈的集成测试
- 若为新领域词，`CONTEXT.md` 补充 **Health check**
- 不为「以后可能用」多加框架

---

## 其他路径

### 修 Bug

```
/aiops 登录从昨天部署后开始 500，帮我定位并修复
```

跳过对齐 → 诊断 → 实现 + 质量门。

### 大功能（多会话）

```
/aiops 做 RBAC：API 鉴权、后台角色、审计日志，拆成多个 issue
```

对齐与设计评审后 → PRD → issues → 每个 issue 新会话 → `/aiops-implement`。

### 优化存量项目

```
/aiops 帮我看看架构有哪些可以优化
```

架构扫描 → 你选一项 → 对齐 → 设计 → 实现。

### 待办 / GitHub issue

需项目根 `aiops.yaml`（`kind: github`）：

```
/triage
```

就绪后：

```
/aiops 实现 #42，按 issue 验收标准做
```

## 故障排除

| 问题 | 处理 |
| --- | --- |
| 不认识 `/aiops` | 重新 `npx -y github:yugasun/aiops`，重启 IDE |
| 插件里命令不对 | 用 `/aiops:aiops` 或改用 npx 安装 |
| 技能行为像旧版 | 重新安装以更新 `skills/aiops/`（含 `journey.md`、`narration.md`） |
| 想换 GitHub tracker | 添加 `aiops.yaml` 或运行 `/aiops-setup` |
| 技能引用错误 | 见 [skill-registry.md](skill-registry.md) |

## 下一步

- [README.md](../README.md) — 总览
- [agent-registry.md](agent-registry.md) — agent 与制品
- [skill-registry.md](skill-registry.md) — 技能列表
- [website/index.html](../website/index.html) — 交互示例

维护者：`bash scripts/verify.sh`
