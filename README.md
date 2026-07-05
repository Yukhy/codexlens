# CodexLens

[![CI](https://github.com/Yukhy/codexlens/actions/workflows/ci.yml/badge.svg)](https://github.com/Yukhy/codexlens/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![macOS](https://img.shields.io/badge/platform-macOS-lightgrey.svg)](#requirements)
[![Local Only](https://img.shields.io/badge/privacy-local--only-2ea44f.svg)](#privacy)

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
