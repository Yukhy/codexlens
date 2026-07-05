'use strict';

let snapshot = null;
let selectedId = null;
let statusFilter = 'active';
let textFilter = '';
let refreshTimer = null;
let language = localStorage.getItem('observer-language') || 'en';
let currentView = 'runs';
let appInfo = null;
let updateCheck = { status: 'idle' };
let loginItem = { supported: false, openAtLogin: false, loaded: false };
let loginItemSetting = false;

const ACTIVE_POLL_MS = 3000;
const IDLE_POLL_MS = 15000;

const I18N = {
  en: {
    appTitle: 'CodexLens',
    loading: 'Loading local activity',
    updated: 'Updated',
    refresh: 'Refresh',
    settings: 'Settings',
    active: 'Active',
    stalled: 'Stalled',
    failed: 'Failed',
    mcpPids: 'MCP PIDs',
    filterActive: 'Active',
    filterAttention: 'Attention',
    filterCompleted: 'Completed',
    filterAll: 'All',
    filterPlaceholder: 'Filter path, job, source',
    noRuns: 'No recent Codex MCP activity found.',
    noMatches: 'No runs match the current filter.',
    selectRun: 'Select a run to inspect local status.',
    settingsTitle: 'Settings',
    settingsDescription: 'Language and update preferences.',
    languageTitle: 'Language',
    startupTitle: 'Startup',
    launchAtLogin: 'Launch CodexLens at login',
    launchAtLoginHint: 'Starts the menu bar app automatically when you log in.',
    launchAtLoginUnavailable: 'Available in the installed app only.',
    updatesTitle: 'Updates',
    updatesDescription: 'Check whether a newer version is available on GitHub Releases.',
    checkForUpdates: 'Check for updates',
    checking: 'Checking…',
    currentVersion: 'Current version',
    upToDate: "You're up to date.",
    updateAvailable: 'New version {version} is available.',
    updateCheckFailed: 'Could not check for updates. Open GitHub Releases to check manually.',
    download: 'Download',
    openLatestRelease: 'Open latest release',
    back: 'Back',
    status: 'Status',
    job: 'Job',
    invokedBy: 'Invoked by',
    source: 'Source',
    codexId: 'Codex ID',
    claude: 'Claude',
    path: 'Path',
    branch: 'Branch',
    changed: 'Changed',
    current: 'Current',
    updatedLabel: 'Updated',
    openRepo: 'Open repo',
    revealRollout: 'Reveal rollout',
    openClaudeLog: 'Open Claude log',
    unknown: 'unknown',
    files: 'files',
    sourceClaudeMcp: 'Claude MCP',
    sourceCodexExec: 'Codex exec',
    sourceCodexMcp: 'Codex MCP',
    sourceCodexApp: 'Codex App',
    sourceCodexSession: 'Codex session',
    ago: 'ago',
    now: 'now'
  },
  ja: {
    appTitle: 'CodexLens',
    loading: 'ローカルアクティビティを読み込み中…',
    updated: '最終更新',
    refresh: '再読み込み',
    settings: '設定',
    active: '実行中',
    stalled: '停滞',
    failed: '失敗',
    mcpPids: 'MCP PID',
    filterActive: '実行中',
    filterAttention: '要確認',
    filterCompleted: '完了',
    filterAll: 'すべて',
    filterPlaceholder: 'パス、ジョブ、呼び出し元で検索',
    noRuns: '最近のCodex MCPアクティビティはありません。',
    noMatches: '現在のフィルターに一致するジョブはありません。',
    selectRun: 'ジョブを選択すると詳細が表示されます。',
    settingsTitle: '設定',
    settingsDescription: '言語やアップデートに関する設定です。',
    languageTitle: '言語',
    startupTitle: '起動設定',
    launchAtLogin: 'ログイン時にCodexLensを自動起動',
    launchAtLoginHint: 'Macへのログイン時に、メニューバーアプリを自動で起動します。',
    launchAtLoginUnavailable: 'インストールしたアプリでのみ設定できます。',
    updatesTitle: 'アップデート',
    updatesDescription: '新しいバージョンが公開されていないか確認できます。',
    checkForUpdates: 'アップデートを確認',
    checking: '確認中…',
    currentVersion: '現在のバージョン',
    upToDate: 'お使いのバージョンは最新です。',
    updateAvailable: '新しいバージョン {version} が利用可能です。',
    updateCheckFailed: '更新情報を取得できませんでした。GitHub Releases で直接ご確認ください。',
    download: 'ダウンロード',
    openLatestRelease: '最新リリースを開く',
    back: '戻る',
    status: '状態',
    job: 'ジョブ',
    invokedBy: '呼び出し元',
    source: 'ソース',
    codexId: 'Codex ID',
    claude: 'Claude',
    path: 'パス',
    branch: 'ブランチ',
    changed: '変更',
    current: '現在の処理',
    updatedLabel: '最終更新',
    openRepo: 'リポジトリを開く',
    revealRollout: 'Rolloutを表示',
    openClaudeLog: 'Claudeログを開く',
    unknown: '不明',
    files: '件',
    sourceClaudeMcp: 'Claude MCP',
    sourceCodexExec: 'Codex exec',
    sourceCodexMcp: 'Codex MCP',
    sourceCodexApp: 'Codex App',
    sourceCodexSession: 'Codex session',
    ago: '前',
    now: 'たった今'
  },
  zh: {
    appTitle: 'CodexLens',
    loading: '正在读取本地活动…',
    updated: '更新于',
    refresh: '刷新',
    settings: '设置',
    active: '运行中',
    stalled: '停滞',
    failed: '失败',
    mcpPids: 'MCP PID',
    filterActive: '运行中',
    filterAttention: '需关注',
    filterCompleted: '已完成',
    filterAll: '全部',
    filterPlaceholder: '按路径、任务、来源筛选',
    noRuns: '未发现最近的 Codex MCP 活动。',
    noMatches: '没有符合当前筛选条件的任务。',
    selectRun: '选择任务以查看详情。',
    settingsTitle: '设置',
    settingsDescription: '语言与更新相关设置。',
    languageTitle: '语言',
    startupTitle: '启动',
    launchAtLogin: '登录时自动启动 CodexLens',
    launchAtLoginHint: '登录 Mac 时自动启动菜单栏应用。',
    launchAtLoginUnavailable: '仅安装版应用可用。',
    updatesTitle: '更新',
    updatesDescription: '检查 GitHub Releases 上是否有新版本。',
    checkForUpdates: '检查更新',
    checking: '正在检查…',
    currentVersion: '当前版本',
    upToDate: '当前已是最新版本。',
    updateAvailable: '发现新版本 {version}。',
    updateCheckFailed: '无法获取更新信息，请前往 GitHub Releases 手动查看。',
    download: '下载',
    openLatestRelease: '打开最新 Release',
    back: '返回',
    status: '状态',
    job: '任务',
    invokedBy: '调用来源',
    source: '来源',
    codexId: 'Codex ID',
    claude: 'Claude',
    path: '路径',
    branch: '分支',
    changed: '变更',
    current: '当前事件',
    updatedLabel: '最后活动',
    openRepo: '打开仓库',
    revealRollout: '显示 Rollout',
    openClaudeLog: '打开 Claude 日志',
    unknown: '未知',
    files: '个文件',
    sourceClaudeMcp: 'Claude MCP',
    sourceCodexExec: 'Codex exec',
    sourceCodexMcp: 'Codex MCP',
    sourceCodexApp: 'Codex App',
    sourceCodexSession: 'Codex session',
    ago: '前',
    now: '刚刚'
  }
};

const STATUS_LABELS = {
  en: {
    starting: 'starting',
    running: 'running',
    editing: 'editing',
    tooling: 'tooling',
    thinking: 'thinking',
    idle: 'idle',
    stalled: 'stalled',
    completed: 'completed',
    failed: 'failed',
    lost: 'lost',
    unknown: 'unknown'
  },
  ja: {
    starting: '開始中',
    running: '実行中',
    editing: '編集中',
    tooling: 'ツール実行中',
    thinking: '思考中',
    idle: '待機中',
    stalled: '停滞',
    completed: '完了',
    failed: '失敗',
    lost: '消失',
    unknown: '不明'
  },
  zh: {
    starting: '启动中',
    running: '运行中',
    editing: '编辑中',
    tooling: '调用工具中',
    thinking: '思考中',
    idle: '空闲',
    stalled: '停滞',
    completed: '已完成',
    failed: '失败',
    lost: '已丢失',
    unknown: '未知'
  }
};

function t(key) {
  return (I18N[language] && I18N[language][key]) || I18N.en[key] || key;
}

function formatT(key, values = {}) {
  return Object.entries(values).reduce(
    (text, [name, value]) => text.replace(`{${name}}`, value == null ? '' : String(value)),
    t(key)
  );
}

function statusLabel(status) {
  return (STATUS_LABELS[language] && STATUS_LABELS[language][status]) || STATUS_LABELS.en[status] || status;
}

const elements = {
  generatedAt: document.getElementById('generated-at'),
  activeCount: document.getElementById('active-count'),
  stalledCount: document.getElementById('stalled-count'),
  failedCount: document.getElementById('failed-count'),
  processCount: document.getElementById('process-count'),
  runList: document.getElementById('run-list'),
  detail: document.getElementById('detail'),
  refresh: document.getElementById('refresh'),
  settings: document.getElementById('settings'),
  backToRuns: document.getElementById('back-to-runs'),
  appViews: Array.from(document.querySelectorAll('.app-view')),
  settingsView: document.getElementById('settings-view'),
  currentVersion: document.getElementById('current-version'),
  launchAtLogin: document.getElementById('launch-at-login'),
  launchAtLoginHint: document.getElementById('launch-at-login-hint'),
  checkForUpdates: document.getElementById('check-for-updates'),
  updateStatus: document.getElementById('update-status'),
  openLatestRelease: document.getElementById('open-latest-release'),
  filterButtons: Array.from(document.querySelectorAll('.filter-button')),
  runFilter: document.getElementById('run-filter'),
  languageButtons: Array.from(document.querySelectorAll('.language-button'))
};

function relTime(ms) {
  if (!ms) return t('unknown');
  const diff = Date.now() - ms;
  if (diff < 0) return t('now');
  const seconds = Math.round(diff / 1000);
  const units = language === 'zh'
    ? { second: '秒', minute: '分钟', hour: '小时', day: '天' }
    : { second: '秒', minute: '分', hour: '時間', day: '日' };
  const format = (value, enUnit, localUnit) => (
    language === 'en' ? `${value}${enUnit} ${t('ago')}` : `${value}${localUnit}${t('ago')}`
  );
  if (seconds < 60) return format(seconds, 's', units.second);
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return format(minutes, 'm', units.minute);
  const hours = Math.round(minutes / 60);
  if (hours < 48) return format(hours, 'h', units.hour);
  const days = Math.round(hours / 24);
  return format(days, 'd', units.day);
}

function shortPath(value) {
  if (!value) return t('unknown');
  const home = snapshot && snapshot.home;
  const text = home && value.startsWith(home) ? `~${value.slice(home.length)}` : value;
  return text.length > 68 ? `${text.slice(0, 32)}…${text.slice(-32)}` : text;
}

function setText(node, value) {
  node.textContent = value == null ? '' : String(value);
}

function makeBadge(status) {
  const badge = document.createElement('span');
  badge.className = `badge status-${status}`;
  badge.textContent = statusLabel(status);
  return badge;
}

function invocationLabel(run) {
  if (run.claude?.toolName?.startsWith('mcp__codex__')) return t('sourceClaudeMcp');
  const source = run.codex?.source || run.source || '';
  const originator = run.codex?.originator || '';
  if (/exec/i.test(source) || /codex_exec/i.test(originator)) return t('sourceCodexExec');
  if (/mcp/i.test(source) || /mcp/i.test(originator)) return t('sourceCodexMcp');
  if (/vscode/i.test(source) || /Codex Desktop/i.test(originator)) return t('sourceCodexApp');
  if (/claude/i.test(run.source || '')) return t('sourceClaudeMcp');
  return source ? `Codex ${source}` : t('sourceCodexSession');
}

function pathForRun(run) {
  return run.repo?.path || run.codex?.cwd || run.claude?.inputCwd || run.claude?.cwd || null;
}

function titleForRun(run) {
  if (run.codex?.threadName) return run.codex.threadName;
  if (run.claude?.toolName) return run.claude.toolName.replace('mcp__codex__', 'Codex ');
  const current = run.progress?.currentLabel;
  if (current && current !== 'unknown') return current;
  const runPath = pathForRun(run);
  return runPath ? runPath.split('/').filter(Boolean).at(-1) : run.source;
}

function statusMatches(run) {
  if (statusFilter === 'all') return true;
  if (statusFilter === 'completed') return run.status === 'completed';
  if (statusFilter === 'attention') return ['idle', 'stalled', 'failed', 'lost', 'unknown'].includes(run.status);
  return !['completed', 'lost'].includes(run.status);
}

function textMatches(run) {
  const query = textFilter.trim().toLowerCase();
  if (!query) return true;
  const haystack = [
    titleForRun(run),
    pathForRun(run),
    invocationLabel(run),
    run.status,
    run.progress?.currentLabel,
    run.id
  ].filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(query);
}

function filteredRuns() {
  return (snapshot?.runs || []).filter((run) => statusMatches(run) && textMatches(run));
}

function renderFilterButtons() {
  for (const button of elements.filterButtons) {
    button.classList.toggle('selected', button.dataset.filter === statusFilter);
  }
}

function renderLanguageButtons() {
  for (const button of elements.languageButtons) {
    button.classList.toggle('selected', button.dataset.language === language);
  }
  document.documentElement.lang = language;
}

function renderView() {
  const showingSettings = currentView === 'settings';
  for (const node of elements.appViews) {
    node.classList.toggle('hidden', showingSettings);
  }
  elements.settingsView.classList.toggle('hidden', !showingSettings);
  elements.refresh.classList.toggle('hidden', showingSettings);
  elements.settings.classList.toggle('hidden', showingSettings);
}

function renderUpdateStatus() {
  elements.currentVersion.textContent = appInfo?.version || '—';
  elements.checkForUpdates.disabled = updateCheck.status === 'checking';
  elements.updateStatus.className = `update-status update-status-${updateCheck.status}`;
  elements.updateStatus.replaceChildren();

  if (updateCheck.status === 'idle') {
    elements.updateStatus.classList.add('hidden');
    return;
  }

  elements.updateStatus.classList.remove('hidden');
  const message = document.createElement('p');
  if (updateCheck.status === 'checking') {
    message.textContent = t('checking');
  } else if (updateCheck.status === 'up-to-date') {
    message.textContent = t('upToDate');
  } else if (updateCheck.status === 'available') {
    message.textContent = formatT('updateAvailable', { version: updateCheck.latestVersion });
  } else {
    message.textContent = t('updateCheckFailed');
  }
  elements.updateStatus.appendChild(message);

  if (updateCheck.status === 'available') {
    elements.updateStatus.appendChild(
      button(t('download'), () => window.observer.openExternal(updateCheck.releaseUrl), !updateCheck.releaseUrl)
    );
  } else if (updateCheck.status === 'failed') {
    elements.updateStatus.appendChild(
      button(t('openLatestRelease'), () => window.observer.openLatestRelease())
    );
  }
}

function renderLoginItem() {
  elements.launchAtLogin.checked = Boolean(loginItem.openAtLogin);
  elements.launchAtLogin.disabled = loginItemSetting || !loginItem.loaded || !loginItem.supported;
  elements.launchAtLoginHint.textContent = loginItem.loaded && !loginItem.supported
    ? t('launchAtLoginUnavailable')
    : t('launchAtLoginHint');
}

function applyTranslations() {
  for (const node of document.querySelectorAll('[data-i18n]')) {
    node.textContent = t(node.dataset.i18n);
  }
  for (const node of document.querySelectorAll('[data-i18n-title]')) {
    node.title = t(node.dataset.i18nTitle);
  }
  for (const node of document.querySelectorAll('[data-i18n-placeholder]')) {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  }
  renderLanguageButtons();
}

function renderRunList() {
  elements.runList.replaceChildren();
  const runs = filteredRuns();

  if (!runs.length) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = snapshot?.runs?.length ? t('noMatches') : t('noRuns');
    elements.runList.appendChild(empty);
    renderDetail(null);
    return;
  }

  if (!selectedId || !runs.some((run) => run.id === selectedId)) selectedId = runs[0].id;

  for (const run of runs) {
    const card = document.createElement('article');
    card.className = `run-card run-card-${run.status}${run.id === selectedId ? ' selected' : ''}`;
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', titleForRun(run));
    const selectRun = () => {
      selectedId = run.id;
      render();
    };
    card.addEventListener('click', selectRun);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectRun();
      }
    });

    const head = document.createElement('div');
    head.className = 'run-head';
    const titleWrap = document.createElement('div');
    titleWrap.className = 'run-title-wrap';
    const statusDot = document.createElement('span');
    statusDot.className = `status-dot status-${run.status}`;
    const title = document.createElement('div');
    title.className = 'run-title';
    title.textContent = titleForRun(run);
    titleWrap.append(statusDot, title);
    const right = document.createElement('div');
    right.className = 'run-badges';
    const source = document.createElement('span');
    source.className = 'source-badge';
    source.textContent = invocationLabel(run);
    right.append(source, makeBadge(run.status));
    head.append(titleWrap, right);

    const meta = document.createElement('div');
    meta.className = 'run-meta';
    meta.textContent = shortPath(pathForRun(run));

    const submeta = document.createElement('div');
    submeta.className = 'run-submeta';
    submeta.textContent = `${run.progress.currentLabel} · ${relTime(run.progress.lastActivityAtMs)}`;

    const foot = document.createElement('div');
    foot.className = 'run-foot';
    foot.append(submeta);

    card.append(head, meta, foot);
    elements.runList.appendChild(card);
  }
}

function row(dl, label, value) {
  const dt = document.createElement('dt');
  const dd = document.createElement('dd');
  dt.textContent = label;
  dd.textContent = value == null || value === '' ? t('unknown') : String(value);
  dl.append(dt, dd);
}

function button(label, onClick, disabled = false) {
  const el = document.createElement('button');
  el.type = 'button';
  el.textContent = label;
  el.disabled = disabled;
  el.addEventListener('click', onClick);
  return el;
}

function renderCounts(run, container) {
  const counts = run.progress.eventCounts || {};
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  if (!entries.length) return;
  const wrap = document.createElement('div');
  wrap.className = 'counts';
  for (const [name, count] of entries) {
    const pill = document.createElement('span');
    pill.className = 'count-pill';
    pill.textContent = `${name} ${count}`;
    wrap.appendChild(pill);
  }
  container.appendChild(wrap);
}

function renderDetail(run) {
  elements.detail.replaceChildren();
  if (!run) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = t('selectRun');
    elements.detail.appendChild(empty);
    return;
  }

  const title = document.createElement('h2');
  title.textContent = titleForRun(run);

  const dl = document.createElement('dl');
  dl.className = 'kv';
  row(dl, t('status'), statusLabel(run.status));
  row(dl, t('job'), titleForRun(run));
  row(dl, t('invokedBy'), invocationLabel(run));
  row(dl, t('source'), run.source);
  row(dl, t('codexId'), run.codex?.id);
  row(dl, t('claude'), run.claude?.sessionId);
  row(dl, t('path'), shortPath(pathForRun(run)));
  row(dl, t('branch'), run.repo?.branch);
  row(dl, t('changed'), run.repo?.modifiedFiles == null ? null : `${run.repo.modifiedFiles} ${t('files')}`);
  row(dl, t('current'), run.progress.currentLabel);
  row(dl, t('updatedLabel'), relTime(run.progress.lastActivityAtMs));

  const actions = document.createElement('div');
  actions.className = 'actions';
  actions.append(
    button(t('openRepo'), () => window.observer.openPath(run.repo?.path || run.codex?.cwd), !(run.repo?.path || run.codex?.cwd)),
    button(t('revealRollout'), () => window.observer.showItemInFolder(run.codex?.rolloutPath), !run.codex?.rolloutPath),
    button(t('openClaudeLog'), () => window.observer.showItemInFolder(run.claude?.logPath), !run.claude?.logPath)
  );

  elements.detail.append(title, dl, actions);
  renderCounts(run, elements.detail);
}

function render() {
  const summary = snapshot?.summary || {};
  applyTranslations();
  renderView();
  setText(elements.generatedAt, snapshot ? `${t('updated')} ${new Date(snapshot.generatedAt).toLocaleTimeString()}` : t('loading'));
  setText(elements.activeCount, summary.active || 0);
  setText(elements.stalledCount, summary.stalled || 0);
  setText(elements.failedCount, summary.failed || 0);
  setText(elements.processCount, summary.codexMcpProcesses || 0);
  renderFilterButtons();
  renderUpdateStatus();
  renderLoginItem();
  renderRunList();
  const selected = filteredRuns().find((run) => run.id === selectedId) || null;
  renderDetail(selected);
}

async function loadAppInfo() {
  try {
    appInfo = await window.observer.getAppInfo();
  } catch (_error) {
    appInfo = null;
  }
  renderUpdateStatus();
}

async function loadLoginItemSettings() {
  try {
    const result = await window.observer.getLoginItemSettings();
    loginItem = {
      supported: Boolean(result?.supported),
      openAtLogin: Boolean(result?.openAtLogin),
      loaded: true
    };
  } catch (_error) {
    loginItem = { supported: false, openAtLogin: false, loaded: true };
  }
  renderLoginItem();
}

function openSettingsView() {
  currentView = 'settings';
  render();
  loadAppInfo();
  loadLoginItemSettings();
}

function shouldPollFast() {
  const summary = snapshot?.summary || {};
  return Boolean((summary.active || 0) > 0 || (summary.stalled || 0) > 0 || (summary.failed || 0) > 0);
}

function scheduleRefresh() {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(refresh, shouldPollFast() ? ACTIVE_POLL_MS : IDLE_POLL_MS);
}

async function refresh() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  elements.refresh.disabled = true;
  try {
    snapshot = await window.observer.getSnapshot();
    render();
  } catch (error) {
    elements.generatedAt.textContent = `Observer error: ${error.message || error}`;
  } finally {
    elements.refresh.disabled = false;
    scheduleRefresh();
  }
}

elements.refresh.addEventListener('click', refresh);
elements.settings.addEventListener('click', openSettingsView);
elements.backToRuns.addEventListener('click', () => {
  currentView = 'runs';
  render();
});
elements.openLatestRelease.addEventListener('click', () => {
  window.observer.openLatestRelease();
});
elements.launchAtLogin.addEventListener('change', async () => {
  const enabled = elements.launchAtLogin.checked;
  loginItemSetting = true;
  renderLoginItem();
  try {
    const result = await window.observer.setLoginItem(enabled);
    if (result?.ok) {
      loginItem = { supported: true, openAtLogin: Boolean(result.openAtLogin), loaded: true };
    } else {
      // The write failed; re-read the OS state instead of guessing.
      await loadLoginItemSettings();
    }
  } catch (_error) {
    await loadLoginItemSettings();
  } finally {
    loginItemSetting = false;
    renderLoginItem();
  }
});
elements.checkForUpdates.addEventListener('click', async () => {
  updateCheck = { status: 'checking' };
  renderUpdateStatus();
  try {
    const result = await window.observer.checkForUpdates();
    if (!result?.ok) {
      appInfo = { version: result?.currentVersion || appInfo?.version };
      updateCheck = { status: 'failed', error: result?.error };
    } else if (result.updateAvailable) {
      appInfo = { version: result.currentVersion };
      updateCheck = {
        status: 'available',
        latestVersion: result.latestVersion,
        releaseUrl: result.releaseUrl
      };
    } else {
      appInfo = { version: result.currentVersion };
      updateCheck = { status: 'up-to-date', latestVersion: result.latestVersion };
    }
  } catch (error) {
    updateCheck = { status: 'failed', error: error?.message || String(error) };
  }
  renderUpdateStatus();
});
for (const button of elements.filterButtons) {
  button.addEventListener('click', () => {
    statusFilter = button.dataset.filter;
    selectedId = null;
    render();
  });
}
elements.runFilter.addEventListener('input', () => {
  textFilter = elements.runFilter.value || '';
  selectedId = null;
  render();
});
for (const button of elements.languageButtons) {
  button.addEventListener('click', () => {
    language = button.dataset.language || 'en';
    localStorage.setItem('observer-language', language);
    render();
  });
}
window.observer.onShowSettings?.(openSettingsView);
applyTranslations();
refresh();
