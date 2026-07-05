'use strict';

let snapshot = null;
let selectedId = null;
let statusFilter = 'active';
let textFilter = '';
let refreshTimer = null;
let language = localStorage.getItem('observer-language') || 'en';
let currentView = 'runs';

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
    settingsDescription: 'Choose how the observer is displayed.',
    languageTitle: 'Language',
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
    loading: 'ローカル活動を読み込み中',
    updated: '更新',
    refresh: '更新',
    settings: '設定',
    active: '稼働中',
    stalled: '停止気味',
    failed: '失敗',
    mcpPids: 'MCP PID',
    filterActive: '稼働中',
    filterAttention: '要確認',
    filterCompleted: '完了',
    filterAll: 'すべて',
    filterPlaceholder: 'パス、ジョブ、呼び出し元で検索',
    noRuns: '最近の Codex MCP 活動はありません。',
    noMatches: '現在のフィルターに一致するジョブはありません。',
    selectRun: 'ジョブを選ぶとローカル状態を確認できます。',
    settingsTitle: '設定',
    settingsDescription: 'Observerの表示方法を選択します。',
    languageTitle: '言語',
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
    current: '現在',
    updatedLabel: '更新',
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
    now: '今'
  },
  zh: {
    appTitle: 'CodexLens',
    loading: '正在读取本地活动',
    updated: '已更新',
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
    selectRun: '选择一个任务查看本地状态。',
    settingsTitle: '设置',
    settingsDescription: '选择观察器的显示方式。',
    languageTitle: '语言',
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
    current: '当前',
    updatedLabel: '更新',
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
    now: '现在'
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
    running: '稼働中',
    editing: '編集中',
    tooling: 'ツール実行',
    thinking: '思考中',
    idle: '待機',
    stalled: '停止気味',
    completed: '完了',
    failed: '失敗',
    lost: '消失',
    unknown: '不明'
  },
  zh: {
    starting: '启动中',
    running: '运行中',
    editing: '编辑中',
    tooling: '工具中',
    thinking: '思考中',
    idle: '空闲',
    stalled: '停滞',
    completed: '已完成',
    failed: '失败',
    lost: '丢失',
    unknown: '未知'
  }
};

function t(key) {
  return (I18N[language] && I18N[language][key]) || I18N.en[key] || key;
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
  renderRunList();
  const selected = filteredRuns().find((run) => run.id === selectedId) || null;
  renderDetail(selected);
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
elements.settings.addEventListener('click', () => {
  currentView = 'settings';
  render();
});
elements.backToRuns.addEventListener('click', () => {
  currentView = 'runs';
  render();
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
applyTranslations();
refresh();
