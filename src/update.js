'use strict';

const https = require('node:https');

const LATEST_RELEASE_API_URL = 'https://api.github.com/repos/Yukhy/codexlens/releases/latest';

function normalizeVersion(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.replace(/^[vV]/, '') || null;
}

function versionSegments(value) {
  const normalized = normalizeVersion(value);
  if (!normalized) return null;
  const core = normalized.split('-', 1)[0];
  const segments = core.split('.');
  if (!segments.length) return null;
  const numbers = [];
  for (const segment of segments) {
    if (!/^\d+$/.test(segment)) return null;
    numbers.push(Number(segment));
  }
  return numbers;
}

function compareVersions(a, b) {
  const aSegments = versionSegments(a);
  const bSegments = versionSegments(b);
  if (!aSegments || !bSegments) return 0;
  const length = Math.max(aSegments.length, bSegments.length);
  for (let index = 0; index < length; index += 1) {
    const left = aSegments[index] || 0;
    const right = bSegments[index] || 0;
    if (left < right) return -1;
    if (left > right) return 1;
  }
  return 0;
}

function isNewerVersion(latest, current) {
  if (!versionSegments(latest) || !versionSegments(current)) return false;
  return compareVersions(latest, current) === 1;
}

function fetchLatestRelease({ timeoutMs = 8000 } = {}) {
  return new Promise((resolve, reject) => {
    const request = https.get(LATEST_RELEASE_API_URL, {
      headers: {
        'User-Agent': 'CodexLens-Update-Check',
        Accept: 'application/vnd.github+json'
      }
    }, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        body += chunk;
      });
      response.on('end', () => {
        if (response.statusCode !== 200) {
          reject(new Error(`GitHub release request failed with status ${response.statusCode}`));
          return;
        }
        try {
          const payload = JSON.parse(body);
          resolve({ tagName: payload.tag_name, htmlUrl: payload.html_url });
        } catch (error) {
          reject(error);
        }
      });
    });

    request.setTimeout(timeoutMs, () => {
      request.destroy(new Error('GitHub release request timed out'));
    });
    request.on('error', reject);
  });
}

module.exports = {
  normalizeVersion,
  compareVersions,
  isNewerVersion,
  fetchLatestRelease
};
