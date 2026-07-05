# Changelog

All notable changes to CodexLens are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-07-05

### Added

- Manual update check in Settings: compares the running version with the latest GitHub release. Runs only when clicked — never in the background.
- Current app version shown in Settings.
- README in three languages as separate files (`README.md`, `README.ja.md`, `README.zh-CN.md`), with install and Gatekeeper guidance for unsigned builds.
- Issue templates, pull request template, and this changelog.

### Changed

- Reworked Japanese and Chinese UI copy for natural phrasing (status labels, settings, empty states).
- Release workflow now uploads DMG/ZIP assets to an existing GitHub release instead of failing when the release was created manually.

### Fixed

- `v0.1.0` release assets were never published because electron-builder refused to publish to an already-existing release (`422 already_exists`). The workflow now builds first and uploads assets with `gh release upload`.

## [0.1.0] - 2026-07-05

### Added

- Initial public release: local, read-only macOS menu bar app observing Codex rollout files, Claude Code project logs, `codex mcp-server` processes, and lightweight Git status.
- Run cards with source labels (Claude MCP, Codex exec, Codex MCP, Codex App, standalone sessions), filters, and a detail pane.
- Multilingual UI (English, Japanese, Chinese).
- Terminal snapshot via `npm run scan`.
- macOS release pipeline (unsigned by default, signed/notarized when Apple secrets are configured).

[Unreleased]: https://github.com/Yukhy/codexlens/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/Yukhy/codexlens/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Yukhy/codexlens/releases/tag/v0.1.0
