# CodexLens

[![CI](https://github.com/Yukhy/codexlens/actions/workflows/ci.yml/badge.svg)](https://github.com/Yukhy/codexlens/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![macOS](https://img.shields.io/badge/platform-macOS-lightgrey.svg)](#requirements)
[![Local Only](https://img.shields.io/badge/privacy-local--only-2ea44f.svg)](#privacy)

**English** | [日本語](#日本語) | [中文](#中文)

CodexLens is a local, read-only macOS menu bar app for watching OpenAI Codex activity, especially when Claude Code calls the official `codex mcp-server`.

It is built for people who use Claude Code plus Codex and want a quick answer to:

- Is Codex still running?
- Which repo/path is it working in?
- Was it invoked through Claude Code MCP, Codex exec, or another Codex session?
- Is it active, idle, stalled, failed, or complete?

CodexLens does not create, wrap, proxy, or replace an MCP server. It observes local files and processes that already exist on your machine.

## Features

- macOS menu bar lens icon with a compact popover UI.
- Active jobs shown by default, with filters for active, attention, completed, and all runs.
- Source labels for Claude MCP, Codex exec, Codex MCP, Codex App, and standalone Codex sessions.
- Repository path, branch, changed file count, current event, and last activity time.
- Local-only scanner for Codex rollout files, Claude Code project logs, `codex mcp-server` processes, and lightweight Git status.
- Multilingual UI: English, Japanese, and Chinese.
- Terminal snapshot with `npm run scan`.

## Why

Claude Code and Codex are powerful together, but Codex MCP work can feel opaque while it is running. CodexLens gives you a small observability layer for local AI agent sessions without changing the way Claude Code or Codex works.

## Privacy

CodexLens is local-only and read-only.

It reads:

- `~/.codex/session_index.jsonl`
- `~/.codex/sessions/**/*.jsonl`
- `~/.claude/projects/**/*.jsonl`
- local `claude`, `codex mcp-server`, and `codex app-server` process labels
- lightweight Git status for detected working directories

It does not:

- read `~/.codex/auth.json`
- send telemetry or session data over the network
- display full prompt text or tool arguments by default
- inspect the private stdio pipe between Claude Code and `codex mcp-server`
- modify Claude Code, Codex, MCP configuration, Git repositories, or session files

CodexLens may display Codex thread titles from `~/.codex/session_index.jsonl` when they are available, because those titles are useful for identifying a run. Avoid sharing screenshots if thread titles or local paths contain sensitive project names.

## Requirements

- macOS
- Node.js 20 or newer
- npm
- Claude Code and/or OpenAI Codex local session files, if you want live activity to appear

## Install And Run

```bash
git clone https://github.com/Yukhy/codexlens.git
cd codexlens
npm install
npm run open:mac
```

Click the lens icon in the macOS menu bar to open the panel.

For a terminal snapshot:

```bash
npm run scan
```

For development:

```bash
npm test
npm start
```

## Current Limits

- Correlation is heuristic-based. CodexLens uses Codex thread ids, working directories, and timing to connect Claude Code tool calls with Codex rollout files.
- If Codex rollout files do not update while official MCP is running, CodexLens can still show process/repo state but not detailed progress.
- Subagent counts are only visible when Codex records distinguishable events in rollout files.
- This is an early macOS-focused app, not a packaged signed release yet.

## Project Structure

- `src/main.js` creates the Electron menu bar app.
- `src/assets/codexlensTemplate.png` and `src/assets/codexlensTemplate@2x.png` are macOS template tray icons.
- `src/assets/codexlens-menubar.svg` is the editable icon source.
- `src/observer/` contains the read-only scanner and correlator.
- `src/renderer/` contains the popover UI.
- `src/cli.js` prints the same snapshot in the terminal.
- `test/` covers the JSONL parsing, Claude Code extraction, Codex rollout parsing, and correlation logic.

## Keywords

OpenAI Codex, Codex CLI, Codex MCP, Claude Code, MCP server, AI agent observability, local agent monitor, macOS menu bar, Electron.

## Support

If CodexLens saves you debugging time, consider supporting the project from GitHub's Sponsor button.

## Disclaimer

CodexLens is an independent, unofficial tool. It is not affiliated with OpenAI or Anthropic.

## License

MIT

---

# 日本語

[English](#codexlens) | **日本語** | [中文](#中文)

CodexLensは、OpenAI Codexのローカル活動を確認するための、読み取り専用macOSメニューバーアプリです。特に、Claude Codeが公式の `codex mcp-server` を呼び出しているときに、裏で何が動いているのかを素早く見るために作っています。

Claude Code + Codexを使っているときに、次のことをすぐ確認できます。

- Codexはまだ動いているのか
- どのリポジトリ/パスで動いているのか
- Claude Code MCP、Codex exec、その他のCodexセッションのどれから呼ばれたのか
- 状態は稼働中、待機、停止気味、失敗、完了のどれか

CodexLensはMCPサーバーを作成、ラップ、プロキシ、置換しません。ローカルに既に存在するファイルとプロセスを観測するだけです。

## 機能

- macOSメニューバーのレンズアイコンとコンパクトなポップオーバーUI
- デフォルトではActiveなジョブを表示し、Active、Attention、Completed、Allでフィルター可能
- Claude MCP、Codex exec、Codex MCP、Codex App、単独Codexセッションの呼び出し元ラベル
- リポジトリパス、ブランチ、変更ファイル数、現在のイベント、最終更新時刻の表示
- Codex rolloutファイル、Claude Code project log、`codex mcp-server` プロセス、軽量なGit状態をローカルで読み取り
- UIは英語、日本語、中文に対応
- `npm run scan` によるターミナルスナップショット

## なぜ作ったか

Claude CodeとCodexの組み合わせは強力ですが、Codex MCP経由の作業は完了するまで見えづらいことがあります。CodexLensは、Claude CodeやCodexの動作を変えずに、ローカルAIエージェントセッションの小さな可視化レイヤーを提供します。

## プライバシー

CodexLensはローカル専用・読み取り専用です。

読み取るもの:

- `~/.codex/session_index.jsonl`
- `~/.codex/sessions/**/*.jsonl`
- `~/.claude/projects/**/*.jsonl`
- ローカルの `claude`、`codex mcp-server`、`codex app-server` のプロセスラベル
- 検出した作業ディレクトリの軽量なGit状態

行わないこと:

- `~/.codex/auth.json` を読まない
- テレメトリやセッションデータをネットワーク送信しない
- デフォルトではプロンプト全文やツール引数を表示しない
- Claude Codeと `codex mcp-server` のprivate stdio pipeを覗かない
- Claude Code、Codex、MCP設定、Gitリポジトリ、セッションファイルを変更しない

利用可能な場合、CodexLensは `~/.codex/session_index.jsonl` のCodexスレッドタイトルを表示することがあります。実行中のジョブを識別するためです。スレッドタイトルやローカルパスに機密プロジェクト名が含まれる場合は、スクリーンショット共有に注意してください。

## 必要環境

- macOS
- Node.js 20以上
- npm
- ライブ活動を表示したい場合は、Claude CodeまたはOpenAI Codexのローカルセッションファイル

## インストールと起動

```bash
git clone https://github.com/Yukhy/codexlens.git
cd codexlens
npm install
npm run open:mac
```

macOSメニューバーのレンズアイコンをクリックするとパネルが開きます。

ターミナルでスナップショットを見る場合:

```bash
npm run scan
```

開発時:

```bash
npm test
npm start
```

## 現在の制限

- 関連付けはヒューリスティックです。CodexLensはCodex thread id、作業ディレクトリ、時刻を使ってClaude Codeのツール呼び出しとCodex rolloutファイルを紐付けます。
- 公式MCP実行中にCodex rolloutファイルが更新されない場合、プロセスやリポジトリ状態は表示できますが、詳細な進捗は表示できません。
- サブエージェント数は、Codexがrolloutファイル内に区別可能なイベントを記録している場合に限って見えます。
- まだ初期段階のmacOS向けアプリで、署名済みパッケージリリースはありません。

## プロジェクト構成

- `src/main.js`: Electronメニューバーアプリ
- `src/assets/codexlensTemplate.png` と `src/assets/codexlensTemplate@2x.png`: macOS template tray icon
- `src/assets/codexlens-menubar.svg`: 編集用アイコンソース
- `src/observer/`: 読み取り専用スキャナーと相関ロジック
- `src/renderer/`: ポップオーバーUI
- `src/cli.js`: 同じスナップショットをターミナルに出力
- `test/`: JSONLパース、Claude Code抽出、Codex rolloutパース、相関ロジックのテスト

## キーワード

OpenAI Codex、Codex CLI、Codex MCP、Claude Code、MCP server、AI agent observability、local agent monitor、macOS menu bar、Electron。

## 支援

CodexLensがデバッグ時間の節約に役立った場合は、GitHubのSponsorボタンから支援できます。

## 免責

CodexLensは独立した非公式ツールです。OpenAIまたはAnthropicとは関係ありません。

## ライセンス

MIT

---

# 中文

[English](#codexlens) | [日本語](#日本語) | **中文**

CodexLens 是一个本地、只读的 macOS 菜单栏应用，用来观察 OpenAI Codex 的活动，尤其适合 Claude Code 调用官方 `codex mcp-server` 的场景。

如果你同时使用 Claude Code 和 Codex，CodexLens 可以快速回答这些问题：

- Codex 还在运行吗？
- 它正在哪个仓库/路径里工作？
- 它是通过 Claude Code MCP、Codex exec，还是其他 Codex 会话启动的？
- 当前状态是运行中、空闲、停滞、失败，还是已完成？

CodexLens 不会创建、封装、代理或替换 MCP server。它只观察你机器上已经存在的本地文件和进程。

## 功能

- macOS 菜单栏镜头图标和紧凑的弹出面板
- 默认显示 Active 任务，并支持 Active、Attention、Completed、All 过滤
- 显示 Claude MCP、Codex exec、Codex MCP、Codex App、独立 Codex session 等来源标签
- 显示仓库路径、分支、变更文件数、当前事件和最后活动时间
- 本地只读扫描 Codex rollout 文件、Claude Code project log、`codex mcp-server` 进程和轻量 Git 状态
- UI 支持英文、日文和中文
- 可通过 `npm run scan` 输出终端快照

## 为什么需要它

Claude Code 和 Codex 配合使用很强大，但通过 Codex MCP 运行的任务在完成前往往不够透明。CodexLens 在不改变 Claude Code 或 Codex 工作方式的前提下，为本地 AI agent session 提供一个小型可观测层。

## 隐私

CodexLens 是本地专用、只读工具。

它会读取：

- `~/.codex/session_index.jsonl`
- `~/.codex/sessions/**/*.jsonl`
- `~/.claude/projects/**/*.jsonl`
- 本地 `claude`、`codex mcp-server`、`codex app-server` 的进程标签
- 检测到的工作目录的轻量 Git 状态

它不会：

- 读取 `~/.codex/auth.json`
- 通过网络发送遥测或 session 数据
- 默认显示完整 prompt 或 tool arguments
- 检查 Claude Code 和 `codex mcp-server` 之间的私有 stdio pipe
- 修改 Claude Code、Codex、MCP 配置、Git 仓库或 session 文件

如果可用，CodexLens 可能会显示 `~/.codex/session_index.jsonl` 中的 Codex thread title，因为这有助于识别任务。如果 thread title 或本地路径包含敏感项目名称，请谨慎分享截图。

## 环境要求

- macOS
- Node.js 20 或更新版本
- npm
- 如果想看到实时活动，需要本地存在 Claude Code 或 OpenAI Codex 的 session 文件

## 安装和运行

```bash
git clone https://github.com/Yukhy/codexlens.git
cd codexlens
npm install
npm run open:mac
```

点击 macOS 菜单栏中的镜头图标即可打开面板。

查看终端快照：

```bash
npm run scan
```

开发时：

```bash
npm test
npm start
```

## 当前限制

- 关联逻辑是启发式的。CodexLens 使用 Codex thread id、工作目录和时间来关联 Claude Code tool call 与 Codex rollout 文件。
- 如果官方 MCP 运行时 Codex rollout 文件没有更新，CodexLens 仍可显示进程/仓库状态，但无法显示详细进度。
- 只有当 Codex 在 rollout 文件中记录了可区分事件时，才能看到 subagent 数量相关信息。
- 这是早期的 macOS 版本，还没有打包签名的正式发布包。

## 项目结构

- `src/main.js`: Electron 菜单栏应用
- `src/assets/codexlensTemplate.png` 和 `src/assets/codexlensTemplate@2x.png`: macOS template tray icon
- `src/assets/codexlens-menubar.svg`: 可编辑图标源文件
- `src/observer/`: 只读扫描器和关联逻辑
- `src/renderer/`: 弹出面板 UI
- `src/cli.js`: 在终端输出同样的快照
- `test/`: JSONL 解析、Claude Code 提取、Codex rollout 解析和关联逻辑测试

## 关键词

OpenAI Codex、Codex CLI、Codex MCP、Claude Code、MCP server、AI agent observability、local agent monitor、macOS menu bar、Electron。

## 支持

如果 CodexLens 帮你节省了调试时间，可以通过 GitHub 的 Sponsor 按钮支持这个项目。

## 免责声明

CodexLens 是一个独立的非官方工具，与 OpenAI 或 Anthropic 没有关联。

## 许可证

MIT
