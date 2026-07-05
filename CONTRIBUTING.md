# Contributing

Issues and pull requests are welcome.

Good contributions for this project include:

- safer parsing for Codex or Claude Code log shape changes
- UI improvements for dense agent activity
- better macOS menu bar behavior
- tests for new session formats
- packaging and signing improvements

## Development setup

```bash
git clone https://github.com/Yukhy/codexlens.git
cd codexlens
npm install
npm run open:mac   # run the menu bar app
npm run scan       # terminal snapshot
```

Before opening a pull request:

```bash
npm test
npm run scan
```

If your change touches UI text, please update all three languages (`en` / `ja` / `zh`) in `src/renderer/renderer.js`. Native-level phrasing is preferred over literal translations — feel free to note in the PR if you'd like a review of a language you're less confident in.

Release packaging is documented in [docs/distribution.md](docs/distribution.md).

Please avoid including raw local session logs, prompt text, private repository paths, tokens, or auth files in issues or pull requests.
