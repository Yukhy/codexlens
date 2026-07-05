'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { listClaudeCodexToolCalls, parseThreadIdFromToolResult } = require('../src/observer/claude');

test('parseThreadIdFromToolResult extracts threadId from JSON content', () => {
  assert.equal(parseThreadIdFromToolResult('{"threadId":"abc","content":"done"}'), 'abc');
});

test('listClaudeCodexToolCalls extracts Codex tool call without prompt text', async () => {
  const home = await fs.mkdtemp(path.join(os.tmpdir(), 'observer-claude-'));
  const dir = path.join(home, '.claude', 'projects', '-repo');
  await fs.mkdir(dir, { recursive: true });
  const log = path.join(dir, 'session.jsonl');
  await fs.writeFile(log, [
    JSON.stringify({
      type: 'assistant',
      timestamp: '2026-07-05T10:00:00.000Z',
      cwd: '/repo',
      sessionId: 'claude-1',
      message: {
        content: [{
          type: 'tool_use',
          id: 'toolu_1',
          name: 'mcp__codex__codex',
          input: {
            prompt: 'secret prompt text',
            cwd: '/repo',
            sandbox: 'read-only',
            'approval-policy': 'never'
          }
        }]
      }
    }),
    JSON.stringify({
      type: 'user',
      timestamp: '2026-07-05T10:01:00.000Z',
      cwd: '/repo',
      sessionId: 'claude-1',
      message: {
        content: [{
          type: 'tool_result',
          tool_use_id: 'toolu_1',
          content: '{"threadId":"codex-1","content":"hidden"}'
        }]
      }
    })
  ].join('\n'));

  const calls = await listClaudeCodexToolCalls({ home, nowMs: Date.now() + 1000, lookbackMs: 365 * 24 * 60 * 60 * 1000 });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].toolName, 'mcp__codex__codex');
  assert.equal(calls[0].cwd, '/repo');
  assert.equal(calls[0].inputCwd, '/repo');
  assert.equal(calls[0].codexThreadId, 'codex-1');
  assert.equal(Object.hasOwn(calls[0], 'prompt'), false);
});
