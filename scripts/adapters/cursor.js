"use strict";

/**
 * Cursor adapter — compiles skills to .cursor/rules/*.mdc format
 *
 * Always-on skills (e.g. lean) become .mdc files with alwaysApply: true.
 * Other skills pass through as SKILL.md copies (existing behavior).
 */

const fs = require("fs");
const path = require("path");

/**
 * Strip YAML frontmatter (---...---) from markdown content.
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
  // Simple field extraction — handles single-line and multi-line (>) values
  const re = new RegExp(`^${field}:\\s*(.+?)$`, "m");
  const m = fm.match(re);
  if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  // Multi-line with >
  const mlRe = new RegExp(`^${field}:\\s*>\\s*\\n((?:\\s+.+\\n)*)`, "m");
  const ml = fm.match(mlRe);
  if (ml) return ml[1].replace(/^\s{2}/gm, "").trim();
  return null;
}

/**
 * Compile an always-on skill into Cursor .mdc format.
 *
 * @param {Object} skill - { name, content, description }
 * @returns {{ filename: string, content: string }}
 */
function compileAlwaysOn(skill) {
  const body = stripFrontmatter(skill.content);
  const desc =
    skill.description ||
    extractField(skill.content, "description") ||
    `${skill.name} discipline`;

  // Cursor .mdc frontmatter — alwaysApply: true makes it inject every turn
  const mdc = `---
description: ${desc}
globs:
alwaysApply: true
---

${body}`;

  return {
    filename: `${skill.name}.mdc`,
    content: mdc,
  };
}

/**
 * Compile a regular (non-always-on) skill. Passthrough — returns SKILL.md as-is.
 *
 * @param {Object} skill - { name, content, description }
 * @returns {{ filename: string, content: string }}
 */
function compileSkill(skill) {
  return {
    filename: `${skill.name}/SKILL.md`,
    content: skill.content,
  };
}

/**
 * Compile an agent definition. Cursor uses markdown with YAML frontmatter.
 *
 * @param {Object} agent - { name, content, description }
 * @returns {{ filename: string, content: string }}
 */
function compileAgent(agent) {
  const content = `---
name: ${agent.name}
description: "${agent.description}"
---

${agent.content}`;

  return {
    filename: `${agent.name}.md`,
    content,
  };
}

// ─── Adapter export ────────────────────────────────────────────────────────

module.exports = {
  id: "cursor",

  /** Where always-on rules go (IDE-native rules directory) */
  rulesDir: {
    global: path.join(require("os").homedir(), ".cursor", "rules"),
    local: ".cursor/rules",
  },

  compileAlwaysOn,
  compileSkill,
  compileAgent,
};
