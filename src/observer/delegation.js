'use strict';

const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { asTimestampMs } = require('./types');

function delegationRunsRoot(options = {}) {
  if (options.runsDir) return path.resolve(options.runsDir);
  const env = options.env || process.env;
  if (env.CODEX_RUNS_DIR) return path.resolve(env.CODEX_RUNS_DIR);
  const home = options.home || os.homedir();
  return path.join(home, '.codex', 'delegation-runs');
}

function stringOrNull(value) {
  return typeof value === 'string' ? value : null;
}

function numberOrNull(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function normalizeRun(raw, runPath, dirPath) {
  if (!raw || typeof raw !== 'object' || raw.schema !== 1) return null;
  const startedAtMs = asTimestampMs(raw.started_at, 0);
  const endedAtMs = asTimestampMs(raw.ended_at, 0);
  return {
    schema: 1,
    task_slug: stringOrNull(raw.task_slug),
    repo: stringOrNull(raw.repo),
    sandbox: stringOrNull(raw.sandbox),
    model: stringOrNull(raw.model),
    effort: stringOrNull(raw.effort),
    launcher_pid: numberOrNull(raw.launcher_pid),
    started_at: stringOrNull(raw.started_at),
    status: stringOrNull(raw.status),
    exit_code: numberOrNull(raw.exit_code),
    ended_at: stringOrNull(raw.ended_at),
    thread_id: stringOrNull(raw.thread_id),
    runPath,
    dirPath,
    startedAtMs,
    endedAtMs: endedAtMs || null
  };
}

async function parseDelegationRun(runPath, dirPath = path.dirname(runPath)) {
  try {
    const text = await fs.readFile(runPath, 'utf8');
    return normalizeRun(JSON.parse(text), runPath, dirPath);
  } catch {
    return null;
  }
}

async function listDelegationRuns(options = {}) {
  const root = delegationRunsRoot(options);
  let entries;
  try {
    entries = await fs.readdir(root, { withFileTypes: true });
  } catch {
    return [];
  }

  const runs = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dirPath = path.join(root, entry.name);
    const run = await parseDelegationRun(path.join(dirPath, 'run.json'), dirPath);
    if (run) runs.push(run);
  }

  runs.sort((a, b) => (b.startedAtMs || 0) - (a.startedAtMs || 0));
  return runs;
}

module.exports = {
  delegationRunsRoot,
  listDelegationRuns,
  parseDelegationRun
};
