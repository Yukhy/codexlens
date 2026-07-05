'use strict';

const fs = require('node:fs/promises');

async function readJsonl(filePath, options = {}) {
  const {
    maxBytes = 8 * 1024 * 1024,
    maxLines = 20000,
    tail = false
  } = options;

  let handle;
  try {
    const stat = await fs.stat(filePath);
    const start = tail && stat.size > maxBytes ? stat.size - maxBytes : 0;
    const length = Math.min(stat.size - start, maxBytes);
    handle = await fs.open(filePath, 'r');
    const buffer = Buffer.alloc(length);
    await handle.read(buffer, 0, length, start);
    const text = buffer.toString('utf8');
    const lines = text.split(/\r?\n/).filter(Boolean);
    const selected = lines.slice(Math.max(0, lines.length - maxLines));
    const objects = [];
    for (const line of selected) {
      try {
        const parsed = JSON.parse(line);
        if (parsed && typeof parsed === 'object') objects.push(parsed);
      } catch {
        // Ignore partial or malformed JSONL lines from files being appended.
      }
    }
    return objects;
  } catch (error) {
    if (error && error.code === 'ENOENT') return [];
    throw error;
  } finally {
    if (handle) await handle.close();
  }
}

module.exports = {
  readJsonl
};
