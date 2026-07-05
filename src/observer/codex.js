'use strict';

const os = require('node:os');
const path = require('node:path');

const { readJsonl } = require('./jsonl');
const { recentFiles } = require('./files');
const { asTimestampMs } = require('./types');

const DEFAULT_LOOKBACK_MS = 24 * 60 * 60 * 1000;

function idFromRolloutPath(filePath) {
  const base = path.basename(filePath, '.jsonl');
  const match = base.match(/rollout-[^-]+-\d\d-\d\dT\d\d-\d\d-\d\d-(.+)$/);
  if (match) return match[1];
  const uuid = base.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  return uuid ? uuid[0] : base;
}

function countInto(target, key) {
  if (!key) return;
  target[key] = (target[key] || 0) + 1;
}

function classifyPayload(payload) {
  if (!payload || typeof payload !== 'object') return { payloadType: null, toolName: null };
  const payloadType = typeof payload.type === 'string' ? payload.type : null;
  const toolName = typeof payload.name === 'string' ? payload.name : null;
  return { payloadType, toolName };
}

async function parseCodexRollout(filePath, stat) {
  const rows = await readJsonl(filePath, {
    maxBytes: 16 * 1024 * 1024,
    maxLines: 50000
  });

  let meta = {};
  const topLevelCounts = {};
  const payloadTypeCounts = {};
  const toolNames = new Set();
  let lastPayloadType = null;
  let lastToolName = null;
  let completed = false;
  let failed = false;

  for (const row of rows) {
    countInto(topLevelCounts, row.type || 'unknown');
    const payload = row && typeof row.payload === 'object' ? row.payload : {};
    if (row.type === 'session_meta') meta = payload;
    const { payloadType, toolName } = classifyPayload(payload);
    if (payloadType) {
      countInto(payloadTypeCounts, payloadType);
      lastPayloadType = payloadType;
      if (payloadType === 'task_complete') completed = true;
      if (/error|failed|failure/i.test(payloadType)) failed = true;
    }
    if (toolName) {
      toolNames.add(toolName);
      lastToolName = toolName;
    }
  }

  const id = meta.id || meta.session_id || idFromRolloutPath(filePath);
  const createdAtMs = asTimestampMs(meta.timestamp, stat.birthtimeMs || stat.ctimeMs || stat.mtimeMs);

  return {
    id,
    rolloutPath: filePath,
    cwd: meta.cwd || null,
    source: meta.source || null,
    originator: meta.originator || null,
    threadSource: meta.thread_source || null,
    cliVersion: meta.cli_version || null,
    threadName: null,
    createdAtMs,
    updatedAtMs: stat.mtimeMs,
    topLevelCounts,
    payloadTypeCounts,
    toolNames: Array.from(toolNames).sort(),
    lastPayloadType,
    lastToolName,
    completed,
    failed
  };
}

async function listCodexSessions(options = {}) {
  const home = options.home || os.homedir();
  const nowMs = options.nowMs || Date.now();
  const lookbackMs = options.lookbackMs || DEFAULT_LOOKBACK_MS;
  const limit = options.limit || 120;
  const sessionsDir = path.join(home, '.codex', 'sessions');
  const files = await recentFiles(sessionsDir, {
    sinceMs: nowMs - lookbackMs,
    limit,
    maxDepth: 6,
    predicate: (file) => path.basename(file).startsWith('rollout-') && file.endsWith('.jsonl')
  });

  const sessions = [];
  for (const { file, stat } of files) {
    try {
      sessions.push(await parseCodexRollout(file, stat));
    } catch {
      // Ignore sessions that are being rewritten or are unreadable.
    }
  }
  sessions.sort((a, b) => b.updatedAtMs - a.updatedAtMs);
  return sessions;
}

async function listCodexSessionIndex(options = {}) {
  const home = options.home || os.homedir();
  const indexPath = path.join(home, '.codex', 'session_index.jsonl');
  try {
    const rows = await readJsonl(indexPath, { maxBytes: 4 * 1024 * 1024, maxLines: 10000 });
    return rows
      .filter((row) => row && typeof row.id === 'string')
      .map((row) => ({
        id: row.id,
        threadName: row.thread_name || null,
        updatedAtMs: asTimestampMs(row.updated_at, 0)
      }))
      .sort((a, b) => b.updatedAtMs - a.updatedAtMs);
  } catch {
    return [];
  }
}

module.exports = {
  listCodexSessions,
  listCodexSessionIndex,
  parseCodexRollout
};
