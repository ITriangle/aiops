"use strict";

/**
 * Windsurf adapter — compiles skills to .windsurf/rules/*.mdc format
 *
 * Windsurf uses the same .mdc format as Cursor but in a different directory.
 * Always-on skills become .mdc files with alwaysApply: true.
 */

const fs = require("fs");
const path = require("path");

// Reuse Cursor adapter's compilation logic (identical .mdc format)
const cursor = require("./cursor");

/**
 * Strip YAML frontmatter from markdown content.
 */
function stripFrontmatter(content) {
  if (!content.startsWith("---")) return content;
  const second = content.indexOf("---", 3);
  if (second === -1) return content;
  return content.slice(second + 3).trimStart();
}

/**
 * Extract a field from YAML frontmatter.
 */
function extractField(content, field) {
  if (!content.startsWith("---")) return null;
  const end = content.indexOf("---", 3);
  if (end === -1) return null;
  const fm = content.slice(3, end);
  const re = new RegExp(`^${field}:\\s*(.+?)$`, "m");
  const m = fm.match(re);
  if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  const mlRe = new RegExp(`^${field}:\\s*>\\s*\\n((?:\\s+.+\\n)*)`, "m");
  const ml = fm.match(mlRe);
  if (ml) return ml[1].replace(/^\s{2}/gm, "").trim();
  return null;
}

/**
 * Compile an always-on skill into Windsurf .mdc format (same as Cursor).
 */
function compileAlwaysOn(skill) {
  // Windsurf .mdc is identical to Cursor .mdc
  return cursor.compileAlwaysOn(skill);
}

/**
 * Compile a regular skill. Passthrough.
 */
function compileSkill(skill) {
  return cursor.compileSkill(skill);
}

/**
 * Compile an agent. Same md-yaml format as Cursor.
 */
function compileAgent(agent) {
  return cursor.compileAgent(agent);
}

// ─── Adapter export ────────────────────────────────────────────────────────

module.exports = {
  id: "windsurf",

  /** Where always-on rules go */
  rulesDir: {
    global: path.join(require("os").homedir(), ".windsurf", "rules"),
    local: ".windsurf/rules",
  },

  compileAlwaysOn,
  compileSkill,
  compileAgent,
};
