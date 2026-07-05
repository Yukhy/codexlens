# Contributing

Issues and pull requests are welcome.

Good contributions for this project include:

- safer parsing for Codex or Claude Code log shape changes
- UI improvements for dense agent activity
- better macOS menu bar behavior
- tests for new session formats
- packaging and signing improvements

Before opening a pull request:

```bash
npm install
npm test
npm run scan
```

If your change adds or edits UI text, update all three languages (`en`, `ja`, `zh`) in the `I18N` and `STATUS_LABELS` tables in `src/renderer/renderer.js`.

Please avoid including raw local session logs, prompt text, private repository paths, tokens, or auth files in issues or pull requests.

## Project structure

- `src/main.js` — the Electron menu bar app (tray, popover window, IPC handlers, manual update check)
- `src/preload.js` — the context-isolated bridge exposed to the renderer as `window.observer`
- `src/observer/` — the read-only scanner and correlator for Codex/Claude session files
- `src/renderer/` — the popover UI (plain HTML/CSS/JS, no bundler)
- `src/update/version.js` — version normalization/comparison used by the update check
- `src/assets/` — macOS template tray icons and the editable SVG source
- `src/cli.js` — prints the same snapshot in the terminal (`npm run scan`)
- `build/` — app icon and macOS signing entitlements
- `scripts/capture-screenshots.js` — regenerates README screenshots from synthetic demo data (`npm run screenshots`)
- `docs/distribution.md` — release, signing, and update behavior
- `test/` — JSONL parsing, Claude Code extraction, Codex rollout parsing, correlation, and version comparison tests
