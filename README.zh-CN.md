<p align="center">
  <img src="docs/assets/logo.png" width="128" alt="CodexLens 图标" />
</p>

<h1 align="center">CodexLens</h1>

<p align="center">
  <b>在 macOS 菜单栏中，一眼看清你的 AI 编程智能体正在做什么。</b>
</p>

<p align="center">
  <a href="https://github.com/Yukhy/codexlens/actions/workflows/ci.yml"><img src="https://github.com/Yukhy/codexlens/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/Yukhy/codexlens/releases/latest"><img src="https://img.shields.io/github/v/release/Yukhy/codexlens?label=release" alt="最新版本" /></a>
  <a href="https://github.com/Yukhy/codexlens/releases"><img src="https://img.shields.io/github/downloads/Yukhy/codexlens/total?label=downloads" alt="下载量" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="许可证: MIT" /></a>
  <a href="#-环境要求"><img src="https://img.shields.io/badge/platform-macOS-lightgrey.svg" alt="macOS" /></a>
  <a href="#-隐私"><img src="https://img.shields.io/badge/privacy-local--only-2ea44f.svg" alt="纯本地" /></a>
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.ja.md">日本語</a> | <b>中文</b>
</p>

---

CodexLens 是一个**纯本地、只读的 macOS 菜单栏应用**，用于观察 OpenAI Codex 的本地活动——尤其适合 Claude Code 通过官方 `codex mcp-server` 调用 Codex 的场景。

如果你同时使用 Claude Code 和 Codex，一定熟悉这种感觉：任务刚委派出去，终端就陷入沉默。Codex 还在干活吗？卡住了吗？它在动哪个仓库？CodexLens 让你在菜单栏里一眼得到答案，而且完全不改变 Claude Code 或 Codex 的工作方式。

| 活动概览 | 语言设置 |
| --- | --- |
| ![CodexLens 活动概览，显示正在运行的 Codex 和 Claude MCP 任务](docs/assets/codexlens-overview.png) | ![CodexLens 语言设置界面](docs/assets/codexlens-settings.png) |

## ✨ 功能

- 🔍 **任务卡片** — 列出检测到的每个 Codex 运行，标注运行中、空闲、停滞、失败或已完成
- 🏷️ **来源标签** — 区分任务来自 Claude MCP、`codex exec`、Codex MCP、Codex 应用还是独立会话
- 📂 **仓库上下文** — 工作目录、分支、变更文件数、当前事件、最后活动时间
- 🧭 **详情面板** — 从任意任务直达对应的 Codex rollout 文件或 Claude Code 日志
- 🎛️ **筛选** — 运行中 / 需关注 / 已完成 / 全部，另支持文本筛选
- 🌏 **多语言界面** — 中文、英文、日文
- 🔄 **手动检查更新** — 一键与 GitHub 最新 Release 比对版本（仅在点击时联网，绝无后台检查）
- 💻 **终端模式** — `npm run scan` 在终端输出同样的快照
- 🔒 **纯本地、只读** — 无遥测、无代理、不封装 MCP server

## 🧐 为什么需要它

Claude Code 与 Codex 配合非常强大，但 Codex MCP 任务在完成之前几乎是黑盒。CodexLens 为本地 AI 智能体会话提供了一个轻量的可观测层：

- 它**不会**创建、封装、代理或替换 MCP server
- 它**只观察**你机器上已经存在的文件和进程
- 「Codex 还活着吗？在哪儿？进展如何？」——看一眼菜单栏就知道

## 📦 安装

### 下载安装（推荐）

1. 从 **[GitHub Releases](https://github.com/Yukhy/codexlens/releases/latest)** 下载最新的 `.dmg`
2. 打开 DMG，把 **CodexLens** 拖入 **Applications**
3. 点击菜单栏中的镜头图标

> [!IMPORTANT]
> **未签名构建的首次启动：** 当前版本尚未经过 Apple 公证，macOS Gatekeeper 会弹出警告。可以通过以下任一方式打开：
> - 打开 **系统设置 → 隐私与安全性**，下拉找到并点击 **「仍要打开」**
> - 或在终端执行：`xattr -dr com.apple.quarantine /Applications/CodexLens.app`
>
> CodexLens 完全开源——你可以审计它做的每一件事，也可以按下面的步骤自行构建。

### 从源码运行

```bash
git clone https://github.com/Yukhy/codexlens.git
cd codexlens
npm install
npm run open:mac
```

想在终端查看快照：

```bash
npm run scan
```

## 🔧 工作原理

CodexLens 定期扫描本地会话文件，并基于 Codex thread id、工作目录和时间进行启发式关联：

- `~/.codex/session_index.jsonl` 和 `~/.codex/sessions/**/*.jsonl` — Codex rollout 文件
- `~/.claude/projects/**/*.jsonl` — Claude Code 项目日志
- 本地 `claude`、`codex mcp-server`、`codex app-server` 进程信息
- 检测到的工作目录的轻量 Git 状态

## 🔒 隐私

CodexLens 纯本地运行、只读。它绝不会向任何地方发送遥测或会话数据。

它发起网络请求的**唯一**情形，是你主动操作时：

- 点击**「检查更新」** — 调用一次 GitHub Releases 公开 API 比对版本
- 点击**「打开最新 Release」** — 在浏览器中打开发布页

它**不会**：

- 读取 `~/.codex/auth.json`
- 默认显示完整 prompt 或工具参数
- 窥探 Claude Code 与 `codex mcp-server` 之间的私有 stdio 管道
- 修改 Claude Code、Codex、MCP 配置、Git 仓库或会话文件

为了便于识别任务，CodexLens 可能会显示 `~/.codex/session_index.jsonl` 中的 Codex 会话标题。如果标题或路径包含敏感项目名称，分享截图时请留意。

## 📋 环境要求

- macOS
- 下载版：无额外要求
- 源码运行：Node.js 20 及以上、npm
- 若要看到实时活动，本地需存在 Claude Code 或 OpenAI Codex 的会话文件

## ⚠️ 当前限制

- 关联逻辑是启发式的，特殊配置下可能偶尔误判任务来源。
- 如果官方 MCP 运行期间 Codex rollout 文件没有更新，CodexLens 仍能显示进程/仓库状态，但无法显示详细进度。
- 仅当 Codex 在 rollout 文件中记录了可区分事件时，才能看到 subagent 数量。
- 在配置 Apple Developer ID Secrets 之前，公开发布均为未签名版本；未签名构建不启用应用内自动**安装**更新（手动检查更新仍然可用）。

发布流程、签名与 Homebrew cask 计划见 [docs/distribution.md](docs/distribution.md)。

## 🗺️ 项目结构

- `src/main.js` — Electron 菜单栏应用
- `src/observer/` — 只读扫描器与关联逻辑
- `src/renderer/` — 弹出面板 UI
- `src/update.js` — 基于 GitHub Releases 的手动更新检查
- `src/cli.js` — 终端快照（`npm run scan`）
- `scripts/capture-screenshots.js` — 用合成演示数据重新生成 README 截图
- `test/` — JSONL 解析、Claude/Codex 提取与关联逻辑测试

## 🤝 参与贡献

欢迎 Issue 和 Pull Request——详见 [CONTRIBUTING.md](CONTRIBUTING.md)。请不要在 Issue 中包含原始会话日志、prompt 或私有路径。

```bash
npm install
npm test
npm run scan
```

## ☕ 支持项目

CodexLens 免费、开源，是在等待智能体跑任务的间隙里开发出来的。

如果它帮你省去了盯着沉默终端怀疑人生的时间——那正是它存在的意义。一杯咖啡的支持，就是下一个功能的燃料：

<p>
  <a href="https://buymeacoffee.com/yukhy0119e"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" height="42" alt="Buy Me A Coffee" /></a>
  &nbsp;
  <a href="https://github.com/sponsors/Yukhy"><img src="https://img.shields.io/badge/GitHub%20Sponsors-%E2%9D%A4-ea4aaa?logo=githubsponsors&style=for-the-badge" height="28" alt="GitHub Sponsors" /></a>
</p>

不花钱也能帮上忙：

- ⭐ **给仓库点个 Star** — 让更多 Claude Code + Codex 用户发现它
- 🐛 [报告 Bug 或提出功能建议](https://github.com/Yukhy/codexlens/issues)
- 📣 分享你的智能体工作截图（记得隐藏机密项目名 😉）

## ⭐ Star 历史

<a href="https://star-history.com/#Yukhy/codexlens&Date">
  <img src="https://api.star-history.com/svg?repos=Yukhy/codexlens&type=Date" alt="Star 历史图" width="600" />
</a>

## 📄 许可证与免责声明

MIT — 见 [LICENSE](LICENSE)。

CodexLens 是独立的非官方工具，与 OpenAI 或 Anthropic 均无关联。
