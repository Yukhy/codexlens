'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { readJsonl } = require('../src/observer/jsonl');

test('readJsonl skips malformed and blank lines', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'observer-jsonl-'));
  const file = path.join(dir, 'sample.jsonl');
  await fs.writeFile(file, '{"a":1}\nnot json\n\n{"b":2}\n');

  const rows = await readJsonl(file);

  assert.deepEqual(rows, [{ a: 1 }, { b: 2 }]);
});

test('readJsonl returns an empty array for missing files', async () => {
  const rows = await readJsonl(path.join(os.tmpdir(), 'missing-observer-file.jsonl'));
  assert.deepEqual(rows, []);
});

test('readJsonl can tail large files by byte limit', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'observer-jsonl-tail-'));
  const file = path.join(dir, 'sample.jsonl');
  const lines = Array.from({ length: 200 }, (_, index) => JSON.stringify({ index }));
  await fs.writeFile(file, `${lines.join('\n')}\n`);

  const rows = await readJsonl(file, { maxBytes: 512, tail: true });

  assert.ok(rows.length > 0);
  assert.equal(rows.at(-1).index, 199);
});
