'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { listCodexSessions, listCodexSessionIndex } = require('../src/observer/codex');

test('listCodexSessions extracts metadata and event counts', async () => {
  const home = await fs.mkdtemp(path.join(os.tmpdir(), 'observer-codex-'));
  const dir = path.join(home, '.codex', 'sessions', '2026', '07', '05');
  await fs.mkdir(dir, { recursive: true });
  const rollout = path.join(dir, 'rollout-2026-07-05T10-00-00-019f-test.jsonl');
  await fs.writeFile(rollout, [
    JSON.stringify({ type: 'session_meta', timestamp: '2026-07-05T10:00:00.000Z', payload: { id: 'codex-1', cwd: '/repo', source: 'mcp', originator: 'codex_mcp_server', cli_version: '0.1' } }),
    JSON.stringify({ type: 'event_msg', timestamp: '2026-07-05T10:00:01.000Z', payload: { type: 'task_started' } }),
    JSON.stringify({ type: 'response_item', timestamp: '2026-07-05T10:00:02.000Z', payload: { type: 'function_call', name: 'exec_command' } }),
    JSON.stringify({ type: 'event_msg', timestamp: '2026-07-05T10:00:03.000Z', payload: { type: 'task_complete' } })
  ].join('\n'));

  const sessions = await listCodexSessions({ home, nowMs: Date.now() + 1000, lookbackMs: 365 * 24 * 60 * 60 * 1000 });

  assert.equal(sessions.length, 1);
  assert.equal(sessions[0].id, 'codex-1');
  assert.equal(sessions[0].cwd, '/repo');
  assert.equal(sessions[0].payloadTypeCounts.function_call, 1);
  assert.deepEqual(sessions[0].toolNames, ['exec_command']);
  assert.equal(sessions[0].completed, true);
});

test('listCodexSessionIndex returns empty array when index is unreadable', async () => {
  const home = await fs.mkdtemp(path.join(os.tmpdir(), 'observer-codex-index-'));
  await fs.mkdir(path.join(home, '.codex', 'session_index.jsonl'), { recursive: true });

  const sessions = await listCodexSessionIndex({ home });

  assert.deepEqual(sessions, []);
});
