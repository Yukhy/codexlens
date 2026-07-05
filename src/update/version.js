'use strict';

function normalizeVersion(tag) {
  if (typeof tag !== 'string') return '0.0.0';
  const value = tag.trim().replace(/^v/i, '');
  return value || '0.0.0';
}

function numericSegments(version) {
  return normalizeVersion(version)
    .split('-', 1)[0]
    .split('.')
    .map((segment) => {
      const value = Number.parseInt(segment, 10);
      return Number.isFinite(value) ? Math.max(0, value) : 0;
    });
}

function compareVersions(a, b) {
  const left = numericSegments(a);
  const right = numericSegments(b);
  const length = Math.max(left.length, right.length, 3);

  for (let index = 0; index < length; index += 1) {
    const leftValue = left[index] || 0;
    const rightValue = right[index] || 0;
    if (leftValue > rightValue) return 1;
    if (leftValue < rightValue) return -1;
  }

  return 0;
}

module.exports = { compareVersions, normalizeVersion };
