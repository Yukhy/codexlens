'use strict';

const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

const execFileAsync = promisify(execFile);

async function git(cwd, args) {
  const { stdout } = await execFileAsync('git', ['-C', cwd, ...args], {
    timeout: 2500,
    maxBuffer: 512 * 1024
  });
  return stdout.trim();
}

async function getRepoInfo(cwd) {
  if (!cwd) return { path: null, branch: null, modifiedFiles: null, isGitRepo: false };
  try {
    const inside = await git(cwd, ['rev-parse', '--is-inside-work-tree']);
    if (inside !== 'true') return { path: cwd, branch: null, modifiedFiles: null, isGitRepo: false };
    const root = await git(cwd, ['rev-parse', '--show-toplevel']);
    let branch = await git(cwd, ['branch', '--show-current']);
    if (!branch) branch = await git(cwd, ['rev-parse', '--short', 'HEAD']);
    const status = await git(cwd, ['status', '--porcelain']);
    const modifiedFiles = status ? status.split(/\r?\n/).filter(Boolean).length : 0;
    return { path: root || cwd, branch: branch || null, modifiedFiles, isGitRepo: true };
  } catch {
    return { path: cwd, branch: null, modifiedFiles: null, isGitRepo: false };
  }
}

module.exports = {
  getRepoInfo
};
