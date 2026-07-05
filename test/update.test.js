'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const { compareVersions, isNewerVersion, normalizeVersion } = require('../src/update');

test('normalizeVersion trims values and removes a leading v', () => {
  assert.equal(normalizeVersion(' v1.2.3 '), '1.2.3');
  assert.equal(normalizeVersion('V2.0.0'), '2.0.0');
  assert.equal(normalizeVersion(''), null);
  assert.equal(normalizeVersion('   '), null);
  assert.equal(normalizeVersion(null), null);
});

test('compareVersions compares numeric dot segments with missing segments as zero', () => {
  assert.equal(compareVersions('1.2.3', '1.2.4'), -1);
  assert.equal(compareVersions('1.2.10', '1.2.3'), 1);
  assert.equal(compareVersions('1.2', '1.2.0'), 0);
  assert.equal(compareVersions('v2.0.0', '1.9.9'), 1);
});

test('compareVersions ignores prerelease suffixes for simple update comparison', () => {
  assert.equal(compareVersions('1.2.3-beta.1', '1.2.3'), 0);
  assert.equal(compareVersions('1.2.4-alpha', '1.2.3'), 1);
});

test('isNewerVersion returns false for invalid versions', () => {
  assert.equal(isNewerVersion('1.0.1', '1.0.0'), true);
  assert.equal(isNewerVersion('1.0.0', '1.0.1'), false);
  assert.equal(isNewerVersion('not-a-version', '1.0.0'), false);
  assert.equal(isNewerVersion('1.0.0', ''), false);
});
