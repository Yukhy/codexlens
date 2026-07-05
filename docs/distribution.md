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

The `Release` GitHub Action runs on either of these triggers:

- publishing a GitHub Release (`release: published`) — from the web UI or `gh release create`,
- manual `workflow_dispatch` with an existing `v*` tag as input (useful for re-uploading assets after a failed run).

A plain `git push --tags` intentionally does not trigger the workflow: creating a release also pushes its tag, and having both events as triggers used to start the same build twice.

To release:

```bash
gh release create v0.2.0 --title v0.2.0 --generate-notes
```

(or draft the release in the GitHub web UI — assets are attached automatically once it is published).

When Apple signing/notarization secrets are absent, the workflow builds unsigned artifacts with electron-builder directly (equivalent to the local `npm run dist:mac:unsigned`, plus `--x64 --arm64`). It calls `npx electron-builder` rather than the npm script so that `workflow_dispatch` can also backfill assets for older tags whose `package.json` predates the current script names.

It then uploads the DMG/ZIP assets with `gh release upload --clobber`, creating the release first only if it does not already exist. This is idempotent: it works whether the release was created by the tag push, by the GitHub web UI (as with v0.1.0), or by a previous partial run. Do not build with `--publish always`; electron-builder fails with `422 already_exists` when a published release for the tag already exists.

Users may see macOS Gatekeeper warnings because the artifacts are not signed or notarized. The README documents the `Open Anyway` / `xattr -cr` workaround.

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

After the secrets are configured, publish a release the same way:

```bash
gh release create v0.2.0 --title v0.2.0 --generate-notes
```

The `Release` GitHub Action runs tests, builds both Apple Silicon and Intel artifacts with electron-builder, signs them with Developer ID, notarizes them with Apple, staples the notarization ticket, and uploads the assets to the GitHub Release.

If the signing secrets are incomplete, the workflow intentionally falls back to the unsigned release path instead of failing.

## Updates

CodexLens does not enable automatic in-app update installation for unsigned macOS builds.

Reason: both Electron and electron-builder document that macOS automatic updates require a signed app. Unsigned builds can still publish release metadata, but the installed app should not rely on Squirrel.Mac/electron-updater to replace itself.

Current behavior:

- Settings shows the current version and a `Check for updates` button. Clicking it makes a single user-initiated HTTPS request to the GitHub Releases API, compares versions, and links to the release page when a newer build exists.
- The menu bar context menu item `Check for Updates...` opens the same Settings view.
- Users download and replace the app manually.
- There are no background or automatic update checks.

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

Apple Developer Programに加入していなくても、未署名のDMG/ZIPをGitHub Releasesへ公開できます。Secretsが未設定の場合、Release workflowは失敗せず未署名リリースへフォールバックします。

リリースはGitHub Releaseの公開（UIまたは `gh release create`）がトリガーです。タグのpush単体ではワークフローは起動しません。UIでリリースを作成するとタグpushイベントも同時に発火して同じビルドが二重に走っていたため、トリガーをrelease公開に一本化しています。アセットのアップロードは `gh release upload --clobber` で行うため、再実行しても安全です（v0.1.0では `--publish always` が既存リリースと衝突して `422 already_exists` で失敗していました。この方式で解消済みです）。

自動インストール型のアップデートは署名済みmacOSアプリが前提です。そのため未署名運用では、設定画面の「アップデートを確認」ボタンでGitHub Releases APIに手動で問い合わせ、新しいバージョンがあればブラウザでダウンロードする方式にしています。バックグラウンドでの自動チェックは行いません。

## 中文备注

即使不加入 Apple Developer Program，也可以通过 GitHub Releases 发布未签名的 DMG/ZIP。没有配置 Secrets 时，Release workflow 不会失败，而是回退到未签名发布。

发布的触发条件是"发布 GitHub Release"（网页 UI 或 `gh release create`）。单独推送标签不会触发 workflow：在 UI 上创建 Release 会同时触发标签推送事件，曾导致同一构建重复运行两次，因此触发条件已统一为 Release 发布。资产上传通过 `gh release upload --clobber` 完成，重复运行也是安全的（v0.1.0 曾因 `--publish always` 与已存在的 Release 冲突而报 `422 already_exists`，现已通过此方式修复）。

macOS 上的应用内自动更新要求应用已签名。因此在未签名发布模式下，用户可以在设置中点击"检查更新"按钮，手动向 GitHub Releases API 查询新版本，并在浏览器中下载。不会进行任何后台自动检查。
