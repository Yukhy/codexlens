#!/usr/bin/env node
'use strict';

const { getSnapshot } = require('./observer');
const { truncateMiddle } = require('./observer/types');

function relTime(ms) {
  if (!ms) return 'unknown';
  const diff = Date.now() - ms;
  const seconds = Math.max(0, Math.round(diff / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  return `${Math.round(minutes / 60)}h`;
}

function repoLabel(run) {
  const value = run.repo?.path || run.codex?.cwd || run.claude?.inputCwd || run.claude?.cwd || 'unknown';
  return truncateMiddle(value, 52);
}

async function main() {
  const snapshot = await getSnapshot();
  console.log(`CodexLens snapshot @ ${snapshot.generatedAt}`);
  console.log(`Runs: ${snapshot.summary.total} | active=${snapshot.summary.active} stalled=${snapshot.summary.stalled} failed=${snapshot.summary.failed} completed=${snapshot.summary.completed} | codex-mcp-pids=${snapshot.summary.codexMcpProcesses}`);
  console.log('');

  if (!snapshot.runs.length) {
    console.log('No recent Codex activity found.');
    return;
  }

  for (const run of snapshot.runs.slice(0, 20)) {
    const updated = relTime(run.progress.lastActivityAtMs);
    const id = truncateMiddle(run.id, 18);
    console.log(`${run.status.padEnd(10)} ${updated.padStart(5)} ${id.padEnd(18)} ${repoLabel(run)}`);
    console.log(`  ${run.progress.currentLabel} | ${run.matchReason}`);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exitCode = 1;
});
