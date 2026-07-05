# Distribution

This document describes how to ship CodexLens as a downloadable macOS app.

## Short Answer

Apple Developer ID signing and notarization are not hard once the credentials exist. The first setup is the slow part:

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

Use this for packaging checks before touching Apple credentials:

```bash
npm ci
npm test
npm run dist:mac:unsigned
```

The generated app and installers are written to `release/`. This build is intentionally unsigned and not notarized.

## GitHub Secrets

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

## Release

After the secrets are configured, create a version tag:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The `Release` GitHub Action runs tests, builds both Apple Silicon and Intel artifacts, signs them with Developer ID, notarizes them with Apple, staples the notarization ticket, and publishes the assets to GitHub Releases.

## Verification

After downloading a release asset, verify it on macOS:

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

簡単かどうかで言うと、初回だけ面倒です。Apple Developer Program、Developer ID Application証明書、notarization用のApple IDまたはApp Store Connect API keyを用意し、GitHub Secretsに登録すれば、その後は `v*` タグをpushするだけで署名済みDMG/ZIPを公開できます。

## 中文备注

整体流程不是每天都要手动做的工作。首次配置 Apple Developer Program、Developer ID Application 证书和 notarization 凭据比较麻烦；配置好 GitHub Secrets 后，推送 `v*` tag 即可自动生成签名并 notarize 的 macOS 发布包。
