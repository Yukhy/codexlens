'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const { correlateRuns, findBestClaudeCall, statusForSession } = require('../src/observer/correlate');

function session(overrides = {}) {
  return {
    id: 'codex-1',
    rolloutPath: '/tmp/rollout.jsonl',
    cwd: '/repo',
    source: 'mcp',
    originator: 'codex_mcp_server',
    threadSource: 'user',
    cliVersion: '0.1',
    createdAtMs: 1000,
    updatedAtMs: 2000,
    topLevelCounts: {},
    payloadTypeCounts: {},
    toolNames: [],
    lastPayloadType: 'function_call',
    lastToolName: 'exec_command',
    completed: false,
    failed: false,
    ...overrides
  };
}

function call(overrides = {}) {
  return {
    id: 'toolu_1',
    toolName: 'mcp__codex__codex',
    logPath: '/tmp/claude.jsonl',
    sessionId: 'claude-1',
    cwd: '/repo',
    inputCwd: '/repo',
    sandbox: 'read-only',
    approvalPolicy: 'never',
    startedAtMs: 900,
    completedAtMs: 3000,
    codexThreadId: 'codex-1',
    isError: false,
    ...overrides
  };
}

test('findBestClaudeCall prefers exact thread id match', () => {
  const result = findBestClaudeCall(session(), [call()]);
  assert.equal(result.confidence, 'high');
  assert.equal(result.call.id, 'toolu_1');
});

test('findBestClaudeCall falls back to cwd and time window', () => {
  const result = findBestClaudeCall(session(), [call({ codexThreadId: null })]);
  assert.equal(result.confidence, 'medium');
});

test('statusForSession detects stalled and completed sessions', () => {
  assert.equal(statusForSession(session({ completed: true }), { nowMs: 100000 }), 'completed');
  assert.equal(statusForSession(session({ updatedAtMs: 0 }), { nowMs: 6 * 60 * 1000, stalledMs: 5 * 60 * 1000, lostMs: 30 * 60 * 1000 }), 'stalled');
});

test('correlateRuns includes unmatched active Claude tool calls as starting runs', () => {
  const result = correlateRuns([], [call({ id: 'toolu_2', completedAtMs: null, codexThreadId: null })], new Map(), [], { nowMs: 2000 });
  assert.equal(result.runs.length, 1);
  assert.equal(result.runs[0].status, 'starting');
  assert.equal(result.summary.active, 1);
});

test('correlateRuns prefers delegation registry thread matches over heuristics', () => {
  const result = correlateRuns(
    [session({ id: 'thread-registered', cwd: '/repo-a' })],
    [call({
      id: 'toolu_other',
      inputCwd: '/repo-a',
      cwd: '/repo-a',
      codexThreadId: null,
      startedAtMs: 1000,
      completedAtMs: 3000
    })],
    new Map(),
    [],
    {
      nowMs: 4000,
      delegationRuns: [{
        task_slug: 'task-one',
        sandbox: 'workspace-write',
        status: 'completed',
        thread_id: 'thread-registered'
      }]
    }
  );

  assert.equal(result.runs.length, 1);
  assert.equal(result.runs[0].confidence, 'high');
  assert.equal(result.runs[0].matchReason, 'delegation run registry');
  assert.equal(result.runs[0].task_slug, 'task-one');
  assert.equal(result.runs[0].sandbox, 'workspace-write');
  assert.equal(result.runs[0].registryStatus, 'completed');
  assert.equal(result.runs[0].claude, null);
});
