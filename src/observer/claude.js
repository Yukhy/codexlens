'use strict';

const os = require('node:os');
const path = require('node:path');

const { readJsonl } = require('./jsonl');
const { recentFiles } = require('./files');
const { asTimestampMs } = require('./types');

const DEFAULT_LOOKBACK_MS = 24 * 60 * 60 * 1000;
const CODEX_TOOL_NAMES = new Set(['mcp__codex__codex', 'mcp__codex__codex-reply']);

function parseThreadIdFromToolResult(content) {
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      return typeof parsed.threadId === 'string' ? parsed.threadId : null;
    } catch {
      const match = content.match(/"threadId"\s*:\s*"([^"]+)"/);
      return match ? match[1] : null;
    }
  }
  if (Array.isArray(content)) {
    for (const item of content) {
      if (item && typeof item === 'object') {
        const text = item.text || item.content;
        const threadId = parseThreadIdFromToolResult(text);
        if (threadId) return threadId;
      }
    }
  }
  return null;
}

function messageContentItems(row) {
  const message = row && typeof row.message === 'object' ? row.message : null;
  const content = message && Array.isArray(message.content) ? message.content : null;
  return content || [];
}

async function parseClaudeProjectLog(filePath) {
  const rows = await readJsonl(filePath, {
    maxBytes: 24 * 1024 * 1024,
    maxLines: 80000
  });
  const callsByToolUseId = new Map();

  for (const row of rows) {
    const rowTime = asTimestampMs(row.timestamp, 0);
    const rowCwd = typeof row.cwd === 'string' ? row.cwd : null;
    const rowSessionId = typeof row.sessionId === 'string' ? row.sessionId : null;
    for (const item of messageContentItems(row)) {
      if (!item || typeof item !== 'object') continue;

      if (item.type === 'tool_use' && CODEX_TOOL_NAMES.has(item.name)) {
        const input = item.input && typeof item.input === 'object' ? item.input : {};
        callsByToolUseId.set(item.id, {
          id: item.id,
          toolName: item.name,
          logPath: filePath,
          sessionId: rowSessionId,
          cwd: rowCwd,
          inputCwd: typeof input.cwd === 'string' ? input.cwd : null,
          sandbox: typeof input.sandbox === 'string' ? input.sandbox : null,
          approvalPolicy: typeof input['approval-policy'] === 'string' ? input['approval-policy'] : null,
          startedAtMs: rowTime,
          completedAtMs: null,
          codexThreadId: null,
          isError: false
        });
      }

      if (item.type === 'tool_result' && item.tool_use_id && callsByToolUseId.has(item.tool_use_id)) {
        const call = callsByToolUseId.get(item.tool_use_id);
        call.completedAtMs = rowTime;
        call.codexThreadId = parseThreadIdFromToolResult(item.content);
        call.isError = Boolean(item.is_error);
      }
    }
  }

  return Array.from(callsByToolUseId.values());
}

async function listClaudeCodexToolCalls(options = {}) {
  const home = options.home || os.homedir();
  const nowMs = options.nowMs || Date.now();
  const lookbackMs = options.lookbackMs || DEFAULT_LOOKBACK_MS;
  const limit = options.limit || 120;
  const projectsDir = path.join(home, '.claude', 'projects');
  const files = await recentFiles(projectsDir, {
    sinceMs: nowMs - lookbackMs,
    limit,
    maxDepth: 8,
    predicate: (file) => file.endsWith('.jsonl')
  });

  const calls = [];
  for (const { file } of files) {
    try {
      calls.push(...await parseClaudeProjectLog(file));
    } catch {
      // Ignore logs that are being appended or have unexpected shape.
    }
  }
  calls.sort((a, b) => b.startedAtMs - a.startedAtMs);
  return calls;
}

module.exports = {
  listClaudeCodexToolCalls,
  parseClaudeProjectLog,
  parseThreadIdFromToolResult
};
