# Distribution

This document describes how to ship CodexLens as a downloadable macOS app.

## Short Answer

CodexLens can be released without Apple Developer secrets. The default release path publishes unsigned macOS DMG/ZIP artifacts from GitHub Actions.

Optional Apple Developer ID signing and notarization can be added later. Once the credentials exist, the release workflow automatically switches to the signed path. The first setup is the slow part:

1. Join the Apple Developer Program.
2. Create and export a `Developer ID Application` certificate.
3. Create notarization credentials.
4. Store those values as GitHub Actions secrets.
5. Push a `v*` tag and let the release workflow build, sign, notarize, staple, and publish the DMG/ZIP assets.

Apple requires Developer ID distribution outside the Mac App Store to use a Developer ID certificate and notarization. Electron tooling can automate the signing/notarization flow when configured.

References:

- [Apple Developer ID](https://developer.apple.com/support/developer-id/)
- [Apple notarization](https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution)
- [electron-builder macOS notarization](https://www.electron.build/docs/features/code-signing/notarization/)
- [electron-builder macOS signing](https://www.electron.build/docs/features/code-signing/code-signing-mac/)
- [Electron Forge macOS signing overview](https://www.electronforge.io/guides/code-signing/code-signing-macos)

## Local Unsigned Build

Use this for packaging checks and for Apple-secrets-free development:

```bash
npm ci
npm test
npm run dist:mac:unsigned
```

The generated app and installers are written to `release/`. This build is intentionally unsigned and not notarized.

## Release Without Apple Secrets

No Apple secrets are required for the default release flow.

Create a version tag:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The `Release` GitHub Action detects that Apple signing/notarization secrets are absent, builds unsigned DMG/ZIP artifacts, and uploads them to the GitHub release for that tag with `gh release upload`. If the release does not exist yet, the workflow creates it; if it was already created manually in the GitHub UI, the assets are attached to it instead of failing.

The workflow can also be started manually (`workflow_dispatch`). Provide the optional `tag` input to attach freshly built assets to an existing tag's release; leave it empty to just build and store the artifacts on the workflow run.

Users may see macOS Gatekeeper warnings because the artifacts are not signed or notarized. The README documents the `Open Anyway` / `xattr -dr com.apple.quarantine` workaround.

## Optional Apple Secrets

Only set these if you want signed and notarized releases later.

Set these in `Settings -> Secrets and variables -> Actions`.

Required for signing:

- `CSC_LINK`: base64-encoded `.p12` export containing the `Developer ID Application` certificate and private key
- `CSC_KEY_PASSWORD`: password used when exporting the `.p12`
- `APPLE_TEAM_ID`: Apple Developer Team ID

Required for notarization, option A:

- `APPLE_ID`: Apple ID email
- `APPLE_APP_SPECIFIC_PASSWORD`: app-specific password for that Apple ID

Required for notarization, option B, recommended for CI:

- `APPLE_API_KEY`: base64-encoded App Store Connect `.p8` key
- `APPLE_API_KEY_ID`: key ID
- `APPLE_API_ISSUER`: issuer ID

Useful macOS commands:

```bash
base64 -i "DeveloperIDApplication.p12" | tr -d '\n' | pbcopy
base64 -i "AuthKey_XXXXXXXXXX.p8" | tr -d '\n' | pbcopy
```

Paste each copied value into the matching GitHub secret.

## Signed Release

After the secrets are configured, create a version tag:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The `Release` GitHub Action runs tests, builds both Apple Silicon and Intel artifacts, signs them with Developer ID, notarizes them with Apple, staples the notarization ticket, and publishes the assets to GitHub Releases.

If the signing secrets are incomplete, the workflow intentionally falls back to the unsigned release path instead of failing.

## Updates

CodexLens does not enable automatic in-app update installation for unsigned macOS builds.

Reason: both Electron and electron-builder document that macOS automatic updates require a signed app. Unsigned builds can still publish release metadata, but the installed app should not rely on Squirrel.Mac/electron-updater to replace itself.

Current behavior:

- Settings has a `Check for updates` button. It calls the public GitHub Releases API once (only when clicked, never in the background), compares the running version with the latest release tag, and shows the result.
- Settings also has an `Open latest release` button, and the menu bar context menu includes `Check for Updates...`, both of which open the GitHub Releases page in the browser.
- Users download and replace the app manually.

Future signed behavior:

- If Developer ID signing is added later, `electron-updater` can be introduced safely.
- The existing `dmg` + `zip` targets and GitHub publish configuration are compatible with that future path.

## Verification

After downloading a signed release asset, verify it on macOS:

```bash
codesign --verify --deep --strict --verbose=2 "/Applications/CodexLens.app"
xcrun stapler validate "/Applications/CodexLens.app"
spctl --assess --verbose --type exec "/Applications/CodexLens.app"
```

## Homebrew Cask

Homebrew should be added after the first GitHub Release exists, because the cask needs stable download URLs and SHA-256 hashes.

Recommended path:

1. Create `Yukhy/homebrew-tap`.
2. Add a `Casks/codexlens.rb` cask pointing to the GitHub Release DMG.
3. Publish install instructions:

```bash
brew tap Yukhy/tap
brew install --cask codexlens
```

## 日本語メモ

Apple Developer Programに入らなくても、未署名のDMG/ZIPをGitHub Releasesへ公開できます。Secretsが未設定の場合でもRelease workflowは失敗せず、未署名リリースへ自動的にフォールバックします。ビルド後の成果物は `gh release upload` でリリースに添付するため、GitHubのUIで先にリリースを作成していても問題ありません。

自動インストール型のアップデートは署名済みmacOSアプリが前提です。そのため未署名運用では、設定画面の「アップデートを確認」(クリック時のみGitHub APIでバージョン比較)と「最新リリースを開く」による手動アップデートにしています。

## 中文备注

即使不加入 Apple Developer Program，也可以通过 GitHub Releases 发布未签名的 DMG/ZIP。未配置 Secrets 时，Release workflow 不会失败，而是自动回退到未签名发布。构建产物通过 `gh release upload` 附加到 Release 上，因此即使先在 GitHub 界面手动创建了 Release 也不会出错。

应用内自动安装更新在 macOS 上需要签名应用。因此未签名版本采用手动更新方式：设置页的「检查更新」（仅在点击时调用 GitHub API 比对版本）和「打开最新 Release」。
