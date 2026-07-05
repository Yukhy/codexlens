'use strict';

/**
 * @typedef {'high'|'medium'|'low'|'none'} Confidence
 */

/**
 * @typedef {'starting'|'running'|'editing'|'tooling'|'thinking'|'idle'|'stalled'|'completed'|'failed'|'lost'|'unknown'} RunStatus
 */

/**
 * @typedef {Object} CodexSession
 * @property {string} id
 * @property {string} rolloutPath
 * @property {string | null} cwd
 * @property {string | null} source
 * @property {string | null} originator
 * @property {string | null} threadSource
 * @property {string | null} cliVersion
 * @property {string | null} threadName
 * @property {number} createdAtMs
 * @property {number} updatedAtMs
 * @property {Record<string, number>} topLevelCounts
 * @property {Record<string, number>} payloadTypeCounts
 * @property {string[]} toolNames
 * @property {string | null} lastPayloadType
 * @property {string | null} lastToolName
 * @property {boolean} completed
 * @property {boolean} failed
 */

/**
 * @typedef {Object} ClaudeToolCall
 * @property {string} id
 * @property {string} toolName
 * @property {string} logPath
 * @property {string | null} sessionId
 * @property {string | null} cwd
 * @property {string | null} inputCwd
 * @property {string | null} sandbox
 * @property {string | null} approvalPolicy
 * @property {number} startedAtMs
 * @property {number | null} completedAtMs
 * @property {string | null} codexThreadId
 * @property {boolean} isError
 */

/**
 * @typedef {Object} ObservedRun
 * @property {string} id
 * @property {RunStatus} status
 * @property {Confidence} confidence
 * @property {CodexSession | null} codex
 * @property {ClaudeToolCall | null} claude
 * @property {Object} repo
 * @property {Object} progress
 */

function asTimestampMs(value, fallback = 0) {
  if (value == null) return fallback;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : fallback;
}

function truncateMiddle(value, max = 80) {
  const text = String(value ?? '');
  if (text.length <= max) return text;
  const head = Math.ceil((max - 1) / 2);
  const tail = Math.floor((max - 1) / 2);
  return `${text.slice(0, head)}…${text.slice(text.length - tail)}`;
}

module.exports = {
  asTimestampMs,
  truncateMiddle
};
