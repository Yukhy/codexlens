'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const { compareVersions, normalizeVersion } = require('../src/update/version');

test('normalizeVersion trims whitespace and strips a leading v', () => {
  assert.equal(normalizeVersion(' v1.2.3 '), '1.2.3');
  assert.equal(normalizeVersion('V2.0.0'), '2.0.0');
});

test('normalizeVersion treats non-string and empty input as 0.0.0', () => {
  assert.equal(normalizeVersion(null), '0.0.0');
  assert.equal(normalizeVersion('   '), '0.0.0');
});

test('compareVersions returns 0 for equal versions and missing zero segments', () => {
  assert.equal(compareVersions('1.2.0', '1.2'), 0);
  assert.equal(compareVersions('v1.2.3', '1.2.3'), 0);
});

test('compareVersions compares patch, minor, and major segments', () => {
  for (const [a, b] of [['1.2.4', '1.2.3'], ['1.3.0', '1.2.9'], ['2.0.0', '1.9.9']]) {
    assert.equal(compareVersions(a, b), 1);
  }
  for (const [a, b] of [['1.2.2', '1.2.3'], ['1.1.9', '1.2.0'], ['0.9.9', '1.0.0']]) {
    assert.equal(compareVersions(a, b), -1);
  }
});

test('compareVersions ignores pre-release suffixes', () => {
  assert.equal(compareVersions('1.2.0-beta', '1.2.0'), 0);
  assert.equal(compareVersions('1.2.1-alpha.1', '1.2.0'), 1);
});

test('compareVersions handles garbage input as zero segments', () => {
  assert.equal(compareVersions(undefined, '0.0.0'), 0);
  assert.equal(compareVersions('garbage', '0.0.1'), -1);
  assert.equal(compareVersions('1.nope.0', '1.0.0'), 0);
});
