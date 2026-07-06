'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { delegationRunsRoot, listDelegationRuns } = require('../src/observer/delegation');

async function writeRun(root, dirName, data) {
  const dir = path.join(root, dirName);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, 'run.json'), `${JSON.stringify(data)}\n`);
}

test('listDelegationRuns parses valid registry run metadata', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'codexlens-delegation-'));
  await writeRun(root, '20260706-120000-task-one', {
    schema: 1,
    task_slug: 'task-one',
    repo: '/repo',
    sandbox: 'workspace-write',
    model: 'gpt-5',
    effort: 'medium',
    launcher_pid: 123,
    started_at: '2026-07-06T12:00:00+09:00',
    status: 'completed',
    exit_code: 0,
    ended_at: '2026-07-06T12:05:00+09:00',
    thread_id: 'thread-1'
  });

  const runs = await listDelegationRuns({ runsDir: root });

  assert.equal(runs.length, 1);
  assert.equal(runs[0].task_slug, 'task-one');
  assert.equal(runs[0].thread_id, 'thread-1');
  assert.equal(runs[0].sandbox, 'workspace-write');
  assert.equal(runs[0].status, 'completed');
  assert.equal(runs[0].runPath, path.join(root, '20260706-120000-task-one', 'run.json'));
  assert.equal(runs[0].startedAtMs, Date.parse('2026-07-06T12:00:00+09:00'));
});

test('listDelegationRuns skips malformed run json files', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'codexlens-delegation-'));
  await writeRun(root, '20260706-120000-good', {
    schema: 1,
    task_slug: 'good',
    repo: '/repo',
    sandbox: 'read-only',
    launcher_pid: 123,
    started_at: '2026-07-06T12:00:00+09:00',
    status: 'running'
  });
  const badDir = path.join(root, '20260706-120100-bad');
  await fs.mkdir(badDir, { recursive: true });
  await fs.writeFile(path.join(badDir, 'run.json'), '{bad json');

  const runs = await listDelegationRuns({ runsDir: root });

  assert.equal(runs.length, 1);
  assert.equal(runs[0].task_slug, 'good');
});

test('listDelegationRuns allows missing thread_id', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'codexlens-delegation-'));
  await writeRun(root, '20260706-120000-no-thread', {
    schema: 1,
    task_slug: 'no-thread',
    repo: '/repo',
    sandbox: 'danger-full-access',
    launcher_pid: 123,
    started_at: '2026-07-06T12:00:00+09:00',
    status: 'failed',
    exit_code: 1
  });

  const runs = await listDelegationRuns({ runsDir: root });

  assert.equal(runs.length, 1);
  assert.equal(runs[0].thread_id, null);
  assert.equal(runs[0].task_slug, 'no-thread');
});

test('delegationRunsRoot respects CODEX_RUNS_DIR override', () => {
  assert.equal(
    delegationRunsRoot({ home: '/home/user', env: { CODEX_RUNS_DIR: '/custom/runs' } }),
    path.resolve('/custom/runs')
  );
});
