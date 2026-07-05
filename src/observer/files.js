'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

async function walkFiles(root, options = {}) {
  const {
    maxDepth = 8,
    predicate = () => true
  } = options;
  const out = [];

  async function visit(dir, depth) {
    if (depth > maxDepth) return;
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await visit(fullPath, depth + 1);
      } else if (entry.isFile() && predicate(fullPath)) {
        out.push(fullPath);
      }
    }
  }

  await visit(root, 0);
  return out;
}

async function recentFiles(root, options = {}) {
  const {
    maxDepth = 8,
    sinceMs = 0,
    limit = 100,
    predicate = () => true
  } = options;
  const files = await walkFiles(root, { maxDepth, predicate });
  const withStats = [];
  for (const file of files) {
    try {
      const stat = await fs.stat(file);
      if (stat.mtimeMs >= sinceMs) withStats.push({ file, stat });
    } catch {
      // Ignore files that disappear while scanning.
    }
  }
  withStats.sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs);
  return withStats.slice(0, limit);
}

module.exports = {
  walkFiles,
  recentFiles
};
