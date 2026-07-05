# Changelog

All notable changes to CodexLens are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.2.0] - 2026-07-05

### Added

- Manual update check in Settings: shows the current version, queries the latest GitHub Release on demand, and offers a download link when a newer version exists. The check only runs when you click the button — never in the background.
- Optional launch-at-login toggle in Settings (registers CodexLens as a macOS login item; available in the installed app).
- `Check for Updates...` in the menu bar context menu now opens the in-app Settings view.
- Per-language READMEs: `README.md` (English), `README.ja.md` (日本語), `README.zh-CN.md` (中文).
- Issue templates, pull request template, and this changelog.

### Fixed

- Release workflow now uploads DMG/ZIP assets to an existing GitHub Release instead of failing with `422 already_exists` when the release was created first (as happened with v0.1.0). The workflow also runs when a release is published from the GitHub UI and can be re-run manually for any tag.
- More natural Japanese and Chinese wording across the app UI and documentation.

### Changed

- npm scripts: `release:mac` / `release:mac:unsigned` replaced by `dist:mac` / `dist:mac:unsigned`; publishing is handled by the GitHub Actions workflow via `gh release upload`.

## [0.1.0] - 2026-07-05

### Added

- Initial public release: local, read-only macOS menu bar app observing OpenAI Codex and Claude Code MCP activity.
- Run cards with source labels (Claude MCP, Codex exec, Codex MCP, Codex App, standalone sessions), status, working directory, branch, changed files, and last activity.
- English, Japanese, and Chinese UI.
- Terminal snapshot via `npm run scan`.
- Unsigned macOS DMG/ZIP release pipeline with optional Developer ID signing.

[0.2.0]: https://github.com/Yukhy/codexlens/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Yukhy/codexlens/releases/tag/v0.1.0
