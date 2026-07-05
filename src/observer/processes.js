'use strict';

const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

const execFileAsync = promisify(execFile);

function labelProcess(command) {
  if (/\bcodex\s+mcp-server\b/.test(command)) return 'codex mcp-server';
  if (/\bcodex\s+app-server\b/.test(command)) return 'codex app-server';
  if (/(^|\/)claude(\s|$)/.test(command)) return 'claude';
  return null;
}

function parsePsLine(line) {
  const match = line.match(/^\s*(\d+)\s+(\d+)\s+([A-Z][a-z]{2}\s+[A-Z][a-z]{2}\s+\d+\s+\d\d:\d\d:\d\d\s+\d{4})\s+(.*)$/);
  if (!match) return null;
  const command = match[4];
  const label = labelProcess(command);
  if (!label) return null;
  return {
    pid: Number(match[1]),
    ppid: Number(match[2]),
    label,
    startedAtText: match[3],
    commandLabel: label
  };
}

async function listAgentProcesses() {
  try {
    const { stdout } = await execFileAsync('ps', ['-axo', 'pid,ppid,lstart,command'], {
      timeout: 2500,
      maxBuffer: 2 * 1024 * 1024
    });
    return stdout
      .split(/\r?\n/)
      .map(parsePsLine)
      .filter(Boolean);
  } catch {
    return [];
  }
}

module.exports = {
  listAgentProcesses,
  parsePsLine
};
