'use strict';

const path = require('node:path');

const DEFAULT_IDLE_MS = 90 * 1000;
const DEFAULT_STALLED_MS = 5 * 60 * 1000;
const DEFAULT_LOST_MS = 15 * 60 * 1000;
const TIME_MATCH_MS = 15 * 60 * 1000;

function normalizePath(value) {
  if (!value) return null;
  return path.resolve(value);
}

function samePath(a, b) {
  const left = normalizePath(a);
  const right = normalizePath(b);
  return Boolean(left && right && left === right);
}

function callCwd(call) {
  return call ? call.inputCwd || call.cwd || null : null;
}

function timeDistance(a, b) {
  if (!a || !b) return Number.POSITIVE_INFINITY;
  return Math.abs(a - b);
}

function findBestClaudeCall(session, calls) {
  let best = { call: null, confidence: 'none', reason: 'no related Claude Codex tool call' };

  for (const call of calls) {
    if (call.codexThreadId && call.codexThreadId === session.id) {
      return { call, confidence: 'high', reason: 'threadId matched Claude tool result' };
    }
  }

  for (const call of calls) {
    const cwdMatches = samePath(session.cwd, callCwd(call));
    const closeToStart = timeDistance(session.createdAtMs, call.startedAtMs) <= TIME_MATCH_MS;
    const overlapsWait = call.completedAtMs
      ? session.createdAtMs >= call.startedAtMs - 5000 && session.createdAtMs <= call.completedAtMs + TIME_MATCH_MS
      : session.createdAtMs >= call.startedAtMs - 5000;

    if (cwdMatches && closeToStart && overlapsWait) {
      return { call, confidence: 'medium', reason: 'cwd and time window matched Claude tool call' };
    }

    if (best.confidence === 'none' && cwdMatches) {
      best = { call, confidence: 'low', reason: 'cwd matched but time/thread id did not' };
    }
  }

  return best;
}

function statusForSession(session, options = {}) {
  const nowMs = options.nowMs || Date.now();
  const idleMs = options.idleMs || DEFAULT_IDLE_MS;
  const stalledMs = options.stalledMs || DEFAULT_STALLED_MS;
  const lostMs = options.lostMs || DEFAULT_LOST_MS;
  const age = Math.max(0, nowMs - session.updatedAtMs);

  if (session.failed) return 'failed';
  if (session.completed) return 'completed';
  if (age >= lostMs) return 'lost';
  if (age >= stalledMs) return 'stalled';
  if (age >= idleMs) return 'idle';
  if (session.lastPayloadType === 'patch_apply_end') return 'editing';
  if (session.lastPayloadType === 'function_call' || session.lastPayloadType === 'custom_tool_call') return 'tooling';
  if (session.lastPayloadType === 'reasoning' || session.lastPayloadType === 'token_count') return 'thinking';
  return 'running';
}

function eventCountTotal(counts) {
  return Object.values(counts || {}).reduce((sum, value) => sum + value, 0);
}

function observedRunFromSession(session, calls, repoInfo, options = {}) {
  const match = findBestClaudeCall(session, calls);
  const status = statusForSession(session, options);
  const source = match.call ? 'official-codex-mcp' : `codex-${session.source || 'session'}`;

  return {
    id: session.id,
    source,
    status,
    confidence: match.confidence,
    matchReason: match.reason,
    codex: session,
    claude: match.call,
    repo: repoInfo || { path: session.cwd || null, branch: null, modifiedFiles: null, isGitRepo: false },
    progress: {
      lastActivityAtMs: session.updatedAtMs,
      currentKind: session.lastPayloadType || 'unknown',
      currentLabel: session.lastToolName || session.lastPayloadType || 'unknown',
      eventCounts: session.payloadTypeCounts,
      totalEvents: eventCountTotal(session.payloadTypeCounts)
    }
  };
}

function startingRunFromClaudeCall(call, options = {}) {
  const nowMs = options.nowMs || Date.now();
  const age = Math.max(0, nowMs - call.startedAtMs);
  let status = 'starting';
  if (call.isError) status = 'failed';
  else if (call.completedAtMs) status = 'unknown';
  else if (age >= (options.stalledMs || DEFAULT_STALLED_MS)) status = 'stalled';

  return {
    id: call.id,
    source: 'claude-codex-tool-call',
    status,
    confidence: 'low',
    matchReason: 'Claude Codex tool call found before matching Codex rollout',
    codex: null,
    claude: call,
    repo: { path: callCwd(call), branch: null, modifiedFiles: null, isGitRepo: false },
    progress: {
      lastActivityAtMs: call.completedAtMs || call.startedAtMs,
      currentKind: call.toolName,
      currentLabel: call.toolName,
      eventCounts: {},
      totalEvents: 0
    }
  };
}

function buildSummary(runs, processes) {
  const summary = {
    total: runs.length,
    active: 0,
    stalled: 0,
    failed: 0,
    completed: 0,
    unknown: 0,
    codexMcpProcesses: processes.filter((process) => process.label === 'codex mcp-server').length
  };
  for (const run of runs) {
    if (['running', 'editing', 'tooling', 'thinking', 'starting', 'idle'].includes(run.status)) summary.active += 1;
    if (run.status === 'stalled') summary.stalled += 1;
    if (run.status === 'failed') summary.failed += 1;
    if (run.status === 'completed') summary.completed += 1;
    if (run.status === 'unknown' || run.status === 'lost') summary.unknown += 1;
  }
  return summary;
}

function correlateRuns(codexSessions, claudeCalls, repoInfoByCwd = new Map(), processes = [], options = {}) {
  const usedCallIds = new Set();
  const runs = codexSessions.map((session) => {
    const repoInfo = session.cwd ? repoInfoByCwd.get(normalizePath(session.cwd)) : null;
    const run = observedRunFromSession(session, claudeCalls, repoInfo, options);
    if (run.claude) usedCallIds.add(run.claude.id);
    return run;
  });

  for (const call of claudeCalls) {
    if (!usedCallIds.has(call.id) && !call.completedAtMs) runs.push(startingRunFromClaudeCall(call, options));
  }

  runs.sort((a, b) => (b.progress.lastActivityAtMs || 0) - (a.progress.lastActivityAtMs || 0));
  return {
    runs,
    summary: buildSummary(runs, processes)
  };
}

module.exports = {
  correlateRuns,
  findBestClaudeCall,
  statusForSession,
  samePath
};
