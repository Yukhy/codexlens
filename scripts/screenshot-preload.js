'use strict';

const { contextBridge } = require('electron');

const now = Date.UTC(2026, 6, 5, 9, 20, 0);
const home = '/Users/demo';

function minutesAgo(minutes) {
  return now - minutes * 60 * 1000;
}

const snapshot = {
  generatedAt: new Date(now).toISOString(),
  home,
  summary: {
    total: 5,
    active: 3,
    stalled: 1,
    failed: 0,
    completed: 1,
    unknown: 0,
    codexMcpProcesses: 2
  },
  runs: [
    {
      id: 'demo-claude-mcp-01',
      source: 'official-codex-mcp',
      status: 'tooling',
      confidence: 'high',
      matchReason: 'threadId matched Claude tool result',
      codex: {
        id: 'demo-claude-mcp-01',
        cwd: `${home}/dev/agent-workbench`,
        source: 'mcp',
        originator: 'codex_mcp_server',
        threadName: 'Implement session timeline',
        rolloutPath: `${home}/.codex/sessions/demo/rollout-demo-claude-mcp-01.jsonl`
      },
      claude: {
        sessionId: 'claude-demo-a',
        toolName: 'mcp__codex__codex',
        inputCwd: `${home}/dev/agent-workbench`,
        cwd: `${home}/dev/agent-workbench`,
        logPath: `${home}/.claude/projects/demo/session.jsonl`
      },
      repo: {
        path: `${home}/dev/agent-workbench`,
        branch: 'feature/session-timeline',
        modifiedFiles: 6,
        isGitRepo: true
      },
      progress: {
        lastActivityAtMs: minutesAgo(1),
        currentKind: 'function_call',
        currentLabel: 'exec_command',
        eventCounts: { reasoning: 18, function_call: 7, patch_apply_end: 2 },
        totalEvents: 27
      }
    },
    {
      id: 'demo-codex-exec-02',
      source: 'codex-exec',
      status: 'thinking',
      confidence: 'none',
      matchReason: 'no related Claude Codex tool call',
      codex: {
        id: 'demo-codex-exec-02',
        cwd: `${home}/dev/codexlens`,
        source: 'exec',
        originator: 'codex_exec',
        threadName: 'Review release checklist',
        rolloutPath: `${home}/.codex/sessions/demo/rollout-demo-codex-exec-02.jsonl`
      },
      claude: null,
      repo: {
        path: `${home}/dev/codexlens`,
        branch: 'main',
        modifiedFiles: 2,
        isGitRepo: true
      },
      progress: {
        lastActivityAtMs: minutesAgo(3),
        currentKind: 'reasoning',
        currentLabel: 'reasoning',
        eventCounts: { reasoning: 14, token_count: 5 },
        totalEvents: 19
      }
    },
    {
      id: 'demo-codex-app-03',
      source: 'codex-session',
      status: 'idle',
      confidence: 'none',
      matchReason: 'no related Claude Codex tool call',
      codex: {
        id: 'demo-codex-app-03',
        cwd: `${home}/dev/docs-site`,
        source: 'vscode',
        originator: 'Codex Desktop',
        threadName: 'Update README screenshots',
        rolloutPath: `${home}/.codex/sessions/demo/rollout-demo-codex-app-03.jsonl`
      },
      claude: null,
      repo: {
        path: `${home}/dev/docs-site`,
        branch: 'docs/screenshots',
        modifiedFiles: 4,
        isGitRepo: true
      },
      progress: {
        lastActivityAtMs: minutesAgo(2),
        currentKind: 'token_count',
        currentLabel: 'token_count',
        eventCounts: { reasoning: 9, token_count: 4 },
        totalEvents: 13
      }
    },
    {
      id: 'demo-stalled-04',
      source: 'official-codex-mcp',
      status: 'stalled',
      confidence: 'medium',
      matchReason: 'cwd and time window matched Claude tool call',
      codex: {
        id: 'demo-stalled-04',
        cwd: `${home}/dev/customer-console`,
        source: 'mcp',
        originator: 'codex_mcp_server',
        threadName: 'Fix preview auth flow',
        rolloutPath: `${home}/.codex/sessions/demo/rollout-demo-stalled-04.jsonl`
      },
      claude: {
        sessionId: 'claude-demo-b',
        toolName: 'mcp__codex__codex',
        inputCwd: `${home}/dev/customer-console`,
        cwd: `${home}/dev/customer-console`,
        logPath: `${home}/.claude/projects/demo/session-b.jsonl`
      },
      repo: {
        path: `${home}/dev/customer-console`,
        branch: 'preview-auth',
        modifiedFiles: 1,
        isGitRepo: true
      },
      progress: {
        lastActivityAtMs: minutesAgo(7),
        currentKind: 'custom_tool_call',
        currentLabel: 'browser_check',
        eventCounts: { reasoning: 21, custom_tool_call: 3 },
        totalEvents: 24
      }
    },
    {
      id: 'demo-completed-05',
      source: 'codex-exec',
      status: 'completed',
      confidence: 'none',
      matchReason: 'no related Claude Codex tool call',
      codex: {
        id: 'demo-completed-05',
        cwd: `${home}/dev/api-service`,
        source: 'exec',
        originator: 'codex_exec',
        threadName: 'Add regression tests',
        rolloutPath: `${home}/.codex/sessions/demo/rollout-demo-completed-05.jsonl`
      },
      claude: null,
      repo: {
        path: `${home}/dev/api-service`,
        branch: 'main',
        modifiedFiles: 0,
        isGitRepo: true
      },
      progress: {
        lastActivityAtMs: minutesAgo(20),
        currentKind: 'task_complete',
        currentLabel: 'task_complete',
        eventCounts: { reasoning: 12, function_call: 4, task_complete: 1 },
        totalEvents: 17
      }
    }
  ],
  processes: [],
  sessionIndex: []
};

contextBridge.exposeInMainWorld('observer', {
  getSnapshot: async () => snapshot,
  getAppInfo: async () => ({ version: '0.2.0', latestReleaseUrl: 'https://github.com/Yukhy/codexlens/releases/latest' }),
  checkForUpdates: async () => ({ ok: true, currentVersion: '0.2.0', latestVersion: '0.2.0', updateAvailable: false, url: 'https://github.com/Yukhy/codexlens/releases/latest' }),
  openLatestRelease: async () => ({ ok: true }),
  openPath: async () => ({ ok: true }),
  showItemInFolder: async () => ({ ok: true })
});
