<p align="center">
  <img src="docs/assets/logo.png" width="128" alt="CodexLens logo" />
</p>

<h1 align="center">CodexLens</h1>

<p align="center">
  <b>See what your AI coding agents are actually doing — right from the macOS menu bar.</b>
</p>

<p align="center">
  <a href="https://github.com/Yukhy/codexlens/actions/workflows/ci.yml"><img src="https://github.com/Yukhy/codexlens/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/Yukhy/codexlens/releases/latest"><img src="https://img.shields.io/github/v/release/Yukhy/codexlens?label=release" alt="Latest release" /></a>
  <a href="https://github.com/Yukhy/codexlens/releases"><img src="https://img.shields.io/github/downloads/Yukhy/codexlens/total?label=downloads" alt="Downloads" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT" /></a>
  <a href="#-requirements"><img src="https://img.shields.io/badge/platform-macOS-lightgrey.svg" alt="macOS" /></a>
  <a href="#-privacy"><img src="https://img.shields.io/badge/privacy-local--only-2ea44f.svg" alt="Local only" /></a>
</p>

<p align="center">
  <b>English</b> | <a href="README.ja.md">日本語</a> | <a href="README.zh-CN.md">中文</a>
</p>

---

CodexLens is a **local, read-only macOS menu bar app** that watches OpenAI Codex activity — especially when Claude Code drives Codex through the official `codex mcp-server`.

If you run Claude Code + Codex together, you know the feeling: you fire off a delegation, and then… silence. Is Codex still working? Did it stall? Which repo is it touching? CodexLens answers those questions at a glance, without changing how Claude Code or Codex work.

| Activity overview | Language settings |
| --- | --- |
| ![CodexLens activity overview showing active Codex and Claude MCP runs](docs/assets/codexlens-overview.png) | ![CodexLens settings screen with language options](docs/assets/codexlens-settings.png) |

## ✨ Features

- 🔍 **Live run cards** — every detected Codex run with status: active, idle, stalled, failed, or complete
- 🏷️ **Source labels** — see whether a run came from Claude MCP, `codex exec`, Codex MCP, the Codex app, or a standalone session
- 📂 **Repo context** — working directory, branch, changed file count, current event, last activity time
- 🧭 **Detail pane** — jump to the related Codex rollout file or Claude Code log for any run
- 🎛️ **Filters** — active / attention / completed / all, plus free-text filtering
- 🌏 **Multilingual UI** — English, 日本語, 中文
- 🔄 **Manual update check** — one click compares your version against the latest GitHub release (only when you click; no background checks)
- 💻 **Terminal mode** — `npm run scan` prints the same snapshot in your terminal
- 🔒 **Local-only and read-only** — no telemetry, no proxying, no MCP server wrapping

## 🧐 Why CodexLens?

Claude Code and Codex are powerful together, but Codex MCP work is opaque while it runs. CodexLens is a small observability layer for local AI agent sessions:

- It **does not** create, wrap, proxy, or replace an MCP server.
- It **only observes** files and processes that already exist on your machine.
- It answers "is Codex alive, where, and how far along?" in one glance at your menu bar.

## 📦 Install

### Download (recommended)

1. Grab the latest `.dmg` from **[GitHub Releases](https://github.com/Yukhy/codexlens/releases/latest)**.
2. Open the DMG and drag **CodexLens** into **Applications**.
3. Click the lens icon in your menu bar.

> [!IMPORTANT]
> **First launch on an unsigned build:** current releases are not yet notarized by Apple, so macOS Gatekeeper will warn you. To open the app anyway:
> - Open **System Settings → Privacy & Security**, scroll down, and click **Open Anyway**, or
> - run: `xattr -dr com.apple.quarantine /Applications/CodexLens.app`
>
> The app is fully open source — you can audit exactly what it does, or build it yourself below.

### From source

```bash
git clone https://github.com/Yukhy/codexlens.git
cd codexlens
npm install
npm run open:mac
```

For a terminal snapshot instead of the menu bar UI:

```bash
npm run scan
```

## 🔧 How it works

CodexLens periodically scans local session artifacts and correlates them heuristically (Codex thread ids + working directories + timing):

- `~/.codex/session_index.jsonl` and `~/.codex/sessions/**/*.jsonl` — Codex rollout files
- `~/.claude/projects/**/*.jsonl` — Claude Code project logs
- local `claude`, `codex mcp-server`, and `codex app-server` process labels
- lightweight Git status for detected working directories

## 🔒 Privacy

CodexLens is local-only and read-only. It never sends telemetry or session data anywhere.

The **only** network requests it ever makes are ones you trigger yourself:

- clicking **Check for updates** calls the public GitHub Releases API once to compare versions
- clicking **Open latest release** opens your browser

It does **not**:

- read `~/.codex/auth.json`
- display full prompt text or tool arguments by default
- inspect the private stdio pipe between Claude Code and `codex mcp-server`
- modify Claude Code, Codex, MCP configuration, Git repositories, or session files

CodexLens may display Codex thread titles from `~/.codex/session_index.jsonl` because they help identify runs. Be mindful when sharing screenshots if titles or paths contain sensitive project names.

## 📋 Requirements

- macOS
- For the downloadable app: nothing else
- From source: Node.js 20+ and npm
- Claude Code and/or OpenAI Codex session files, if you want live activity to appear

## ⚠️ Current limits

- Correlation is heuristic-based; unusual setups may occasionally mislabel a run's source.
- If Codex rollout files do not update while official MCP is running, CodexLens shows process/repo state but not detailed progress.
- Subagent counts appear only when Codex records distinguishable events in rollout files.
- Public releases are unsigned until Apple Developer ID secrets are configured; automatic in-app update *installation* stays disabled for unsigned builds (the manual check still works).

See [docs/distribution.md](docs/distribution.md) for the release pipeline, signing, and Homebrew cask plans.

## 🗺️ Project structure

- `src/main.js` — Electron menu bar app
- `src/observer/` — read-only scanner and correlator
- `src/renderer/` — popover UI
- `src/update.js` — manual update check against GitHub Releases
- `src/cli.js` — terminal snapshot (`npm run scan`)
- `scripts/capture-screenshots.js` — regenerates README screenshots from synthetic demo data
- `test/` — JSONL parsing, Claude/Codex extraction, and correlation tests

## 🤝 Contributing

Issues and pull requests are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). Please never include raw session logs, prompts, or private paths in issues.

```bash
npm install
npm test
npm run scan
```

## ☕ Support

CodexLens is free, open source, and built in spare time between agent runs.

If it has ever saved you from staring at a silent terminal wondering *"is Codex still alive?"* — that's exactly the moment it was built for. You can keep the coffee (and the commits) flowing:

<p>
  <a href="https://buymeacoffee.com/yukhy0119e"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" height="42" alt="Buy Me A Coffee" /></a>
  &nbsp;
  <a href="https://github.com/sponsors/Yukhy"><img src="https://img.shields.io/badge/GitHub%20Sponsors-%E2%9D%A4-ea4aaa?logo=githubsponsors&style=for-the-badge" height="28" alt="GitHub Sponsors" /></a>
</p>

Other free ways to help:

- ⭐ **Star this repo** — it genuinely helps other Claude Code + Codex users find it
- 🐛 [Report a bug or request a feature](https://github.com/Yukhy/codexlens/issues)
- 📣 Share a screenshot of your agent fleet (minus the secret project names 😉)

## ⭐ Star history

<a href="https://star-history.com/#Yukhy/codexlens&Date">
  <img src="https://api.star-history.com/svg?repos=Yukhy/codexlens&type=Date" alt="Star History Chart" width="600" />
</a>

## 📄 License & disclaimer

MIT — see [LICENSE](LICENSE).

CodexLens is an independent, unofficial tool. It is not affiliated with OpenAI or Anthropic.
