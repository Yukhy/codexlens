<p align="center">
  <img src="docs/assets/logo.png" width="128" alt="CodexLensのロゴ" />
</p>

<h1 align="center">CodexLens</h1>

<p align="center">
  <b>AIコーディングエージェントが「いま何をしているか」を、macOSメニューバーからひと目で。</b>
</p>

<p align="center">
  <a href="https://github.com/Yukhy/codexlens/actions/workflows/ci.yml"><img src="https://github.com/Yukhy/codexlens/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/Yukhy/codexlens/releases/latest"><img src="https://img.shields.io/github/v/release/Yukhy/codexlens?label=release" alt="最新リリース" /></a>
  <a href="https://github.com/Yukhy/codexlens/releases"><img src="https://img.shields.io/github/downloads/Yukhy/codexlens/total?label=downloads" alt="ダウンロード数" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="ライセンス: MIT" /></a>
  <a href="#-動作環境"><img src="https://img.shields.io/badge/platform-macOS-lightgrey.svg" alt="macOS" /></a>
  <a href="#-プライバシー"><img src="https://img.shields.io/badge/privacy-local--only-2ea44f.svg" alt="ローカル完結" /></a>
</p>

<p align="center">
  <a href="README.md">English</a> | <b>日本語</b> | <a href="README.zh-CN.md">中文</a>
</p>

---

CodexLensは、OpenAI Codexのローカルでの動きを可視化する、**読み取り専用のmacOSメニューバーアプリ**です。とくにClaude Codeが公式の `codex mcp-server` 経由でCodexを動かしているときに力を発揮します。

Claude Code + Codexを使っていると、こんな瞬間がありませんか。タスクを委譲した直後から、ターミナルは沈黙。「Codexはまだ動いているのか？ 止まっているのか？ どのリポジトリを触っているのか？」——CodexLensは、その疑問にメニューバーからひと目で答えます。Claude CodeやCodexの動作には一切手を加えません。

| アクティビティ一覧 | 言語設定 |
| --- | --- |
| ![実行中のCodexとClaude MCPのジョブを一覧表示したCodexLensの画面](docs/assets/codexlens-overview.png) | ![CodexLensの言語設定画面](docs/assets/codexlens-settings.png) |

## ✨ 機能

- 🔍 **ジョブカード表示** — 検出したCodexの実行を、実行中・待機中・停滞・失敗・完了のステータス付きで一覧表示
- 🏷️ **呼び出し元ラベル** — Claude MCP / `codex exec` / Codex MCP / Codexアプリ / 単独セッションのどこから起動されたかを表示
- 📂 **リポジトリ情報** — 作業ディレクトリ、ブランチ、変更ファイル数、現在のイベント、最終更新時刻
- 🧭 **詳細ペイン** — 各ジョブから関連するCodexのrolloutファイルやClaude Codeのログへすぐ移動
- 🎛️ **フィルター** — 実行中 / 要確認 / 完了 / すべて、およびテキストでの絞り込み
- 🌏 **多言語UI** — 日本語・英語・中国語
- 🔄 **手動アップデート確認** — ボタンひとつで最新のGitHub Releaseとバージョン比較(クリックしたときだけ。バックグラウンド通信はしません)
- 💻 **ターミナルモード** — `npm run scan` で同じスナップショットをターミナルに表示
- 🔒 **ローカル完結・読み取り専用** — テレメトリなし、プロキシなし、MCPサーバーのラップなし

## 🧐 なぜ作ったか

Claude CodeとCodexの組み合わせは強力ですが、Codex MCP経由の作業は終わるまで中が見えません。CodexLensは、ローカルのAIエージェントセッションのための小さな可視化レイヤーです。

- MCPサーバーを**作成・ラップ・プロキシ・置き換えしません**
- すでにマシン上に存在するファイルとプロセスを**観測するだけ**です
- 「Codexは生きているか、どこで、どこまで進んだか」がメニューバーを見るだけで分かります

## 📦 インストール

### ダウンロード(推奨)

1. **[GitHub Releases](https://github.com/Yukhy/codexlens/releases/latest)** から最新の `.dmg` をダウンロード
2. DMGを開いて **CodexLens** を **アプリケーション** フォルダへドラッグ
3. メニューバーのレンズアイコンをクリック

> [!IMPORTANT]
> **未署名ビルドの初回起動について:** 現在のリリースはAppleの公証(notarization)を受けていないため、macOSのGatekeeperが警告を表示します。起動するには次のいずれかを行ってください。
> - **システム設定 → プライバシーとセキュリティ** を開き、下の方にある **「このまま開く」** をクリック
> - またはターミナルで: `xattr -dr com.apple.quarantine /Applications/CodexLens.app`
>
> CodexLensは完全にオープンソースです。何をしているかはコードで確認できますし、下記の手順で自分でビルドすることもできます。

### ソースから実行

```bash
git clone https://github.com/Yukhy/codexlens.git
cd codexlens
npm install
npm run open:mac
```

メニューバーUIの代わりにターミナルで確認する場合:

```bash
npm run scan
```

## 🔧 仕組み

CodexLensはローカルのセッション関連ファイルを定期的にスキャンし、Codexのthread id・作業ディレクトリ・タイミングを手がかりにヒューリスティックに関連付けます。

- `~/.codex/session_index.jsonl` と `~/.codex/sessions/**/*.jsonl` — Codexのrolloutファイル
- `~/.claude/projects/**/*.jsonl` — Claude Codeのプロジェクトログ
- ローカルの `claude`、`codex mcp-server`、`codex app-server` のプロセス情報
- 検出した作業ディレクトリの軽量なGit状態

## 🔒 プライバシー

CodexLensはローカル完結・読み取り専用です。テレメトリやセッションデータを外部に送信することは一切ありません。

ネットワーク通信が発生するのは、**自分で操作したときだけ**です。

- **「アップデートを確認」** をクリックしたとき — GitHub Releasesの公開APIを1回呼び、バージョンを比較します
- **「最新リリースを開く」** をクリックしたとき — ブラウザでリリースページを開きます

次のことは**行いません**。

- `~/.codex/auth.json` の読み取り
- プロンプト全文やツール引数のデフォルト表示
- Claude Codeと `codex mcp-server` の間のstdioパイプの盗み見
- Claude Code・Codex・MCP設定・Gitリポジトリ・セッションファイルの変更

なお、ジョブの識別に役立つため、`~/.codex/session_index.jsonl` にあるCodexのスレッドタイトルを表示することがあります。タイトルやパスに機密性の高いプロジェクト名が含まれる場合は、スクリーンショットの共有にご注意ください。

## 📋 動作環境

- macOS
- ダウンロード版: 追加要件なし
- ソースから実行する場合: Node.js 20以上とnpm
- ライブのアクティビティを表示するには、Claude CodeまたはOpenAI Codexのローカルセッションファイルが必要です

## ⚠️ 現在の制限

- 関連付けはヒューリスティックです。特殊な構成では呼び出し元ラベルを誤判定することがあります。
- 公式MCPの実行中にCodexのrolloutファイルが更新されない場合、プロセスやリポジトリの状態は表示できますが、詳細な進捗は表示できません。
- サブエージェント数は、Codexがrolloutファイルに識別可能なイベントを記録している場合のみ表示されます。
- Apple Developer IDのSecretsを設定するまで、公開リリースは未署名です。未署名ビルドではアプリ内の自動アップデート「インストール」は無効のままです(手動のアップデート確認は使えます)。

リリースパイプライン・署名・Homebrew caskの計画は [docs/distribution.md](docs/distribution.md) を参照してください。

## 🗺️ プロジェクト構成

- `src/main.js` — Electronメニューバーアプリ本体
- `src/observer/` — 読み取り専用のスキャナーと関連付けロジック
- `src/renderer/` — ポップオーバーUI
- `src/update.js` — GitHub Releasesとの手動アップデート照合
- `src/cli.js` — ターミナル用スナップショット(`npm run scan`)
- `scripts/capture-screenshots.js` — 合成デモデータからREADME用スクリーンショットを再生成
- `test/` — JSONLパース、Claude/Codex抽出、関連付けロジックのテスト

## 🤝 コントリビュート

IssueもPull Requestも歓迎です。詳しくは [CONTRIBUTING.md](CONTRIBUTING.md) をどうぞ。Issueには生のセッションログ・プロンプト・プライベートなパスを含めないようお願いします。

```bash
npm install
npm test
npm run scan
```

## ☕ 応援する

CodexLensは無料のオープンソースで、エージェントの実行待ちのすき間時間に開発されています。

「Codexまだ動いてるのかな…」と黙ったターミナルを見つめる時間をこのアプリが減らせたなら、それがまさに作った甲斐です。コーヒー1杯分の応援が、次の機能開発の燃料になります。

<p>
  <a href="https://buymeacoffee.com/yukhy0119e"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" height="42" alt="Buy Me A Coffee" /></a>
  &nbsp;
  <a href="https://github.com/sponsors/Yukhy"><img src="https://img.shields.io/badge/GitHub%20Sponsors-%E2%9D%A4-ea4aaa?logo=githubsponsors&style=for-the-badge" height="28" alt="GitHub Sponsors" /></a>
</p>

お金をかけずに応援する方法もあります。

- ⭐ **このリポジトリにスターを付ける** — 同じ悩みを持つClaude Code + Codexユーザーに届きやすくなります
- 🐛 [バグ報告・機能リクエスト](https://github.com/Yukhy/codexlens/issues)
- 📣 エージェントが並んで働いている画面を共有(機密プロジェクト名は隠して 😉)

## ⭐ スター履歴

<a href="https://star-history.com/#Yukhy/codexlens&Date">
  <img src="https://api.star-history.com/svg?repos=Yukhy/codexlens&type=Date" alt="スター履歴チャート" width="600" />
</a>

## 📄 ライセンス・免責

MIT — [LICENSE](LICENSE) を参照してください。

CodexLensは独立した非公式ツールであり、OpenAIおよびAnthropicとは関係ありません。
