'use strict';

const os = require('node:os');
const path = require('node:path');

const { listClaudeCodexToolCalls } = require('./claude');
const { listCodexSessions, listCodexSessionIndex } = require('./codex');
const { correlateRuns } = require('./correlate');
const { listDelegationRuns } = require('./delegation');
const { listAgentProcesses } = require('./processes');
const { getRepoInfo } = require('./repo');

async function getSnapshot(options = {}) {
  const home = options.home || os.homedir();
  const nowMs = options.nowMs || Date.now();
  const lookbackMs = options.lookbackMs || 24 * 60 * 60 * 1000;

  const [rawCodexSessions, claudeCalls, processes, sessionIndex, delegationRuns] = await Promise.all([
    listCodexSessions({ home, nowMs, lookbackMs, limit: options.codexLimit || 120 }),
    listClaudeCodexToolCalls({ home, nowMs, lookbackMs, limit: options.claudeLimit || 120 }),
    listAgentProcesses(),
    listCodexSessionIndex({ home }),
    listDelegationRuns({ home, runsDir: options.runsDir })
  ]);

  const indexById = new Map(sessionIndex.map((item) => [item.id, item]));
  const codexSessions = rawCodexSessions.map((session) => ({
    ...session,
    threadName: indexById.get(session.id)?.threadName || null
  }));

  const cwdSet = new Set(codexSessions.map((session) => session.cwd).filter(Boolean).map((cwd) => path.resolve(cwd)));
  for (const call of claudeCalls) {
    const cwd = call.inputCwd || call.cwd;
    if (cwd) cwdSet.add(path.resolve(cwd));
  }
  for (const run of delegationRuns) {
    if (run.repo) cwdSet.add(path.resolve(run.repo));
  }

  const repoInfoByCwd = new Map();
  await Promise.all(Array.from(cwdSet).slice(0, 20).map(async (cwd) => {
    repoInfoByCwd.set(cwd, await getRepoInfo(cwd));
  }));

  const { runs, summary } = correlateRuns(codexSessions, claudeCalls, repoInfoByCwd, processes, {
    nowMs,
    idleMs: options.idleMs,
    stalledMs: options.stalledMs,
    lostMs: options.lostMs,
    delegationRuns
  });

  return {
    generatedAt: new Date(nowMs).toISOString(),
    home,
    runs,
    delegationRuns,
    processes,
    sessionIndex: sessionIndex.slice(0, 30),
    summary
  };
}

module.exports = {
  getSnapshot
};
