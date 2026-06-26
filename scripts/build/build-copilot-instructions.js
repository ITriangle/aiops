#!/usr/bin/env node
// build-copilot-instructions.js — Generate .github/copilot-instructions.md
//
// Usage: node scripts/build/build-copilot-instructions.js
// Output: .github/copilot-instructions.md at repo root

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const SKILLS_DIR = path.join(ROOT, "skills");
const MANIFEST_PATH = path.join(SKILLS_DIR, "manifest.json");
const OUTPUT_DIR = path.join(ROOT, ".github");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "copilot-instructions.md");

const { getAdapter } = require("../adapters");
const copilot = getAdapter("copilot");

// ─── Load always-on skills ─────────────────────────────────────────────────

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
const alwaysOnSkills = (manifest.tier1 || []).filter((s) => s.alwaysOn);

if (alwaysOnSkills.length === 0) {
  console.log("No alwaysOn skills found in manifest. Nothing to generate.");
  process.exit(0);
}

// ─── Generate copilot-instructions.md ──────────────────────────────────────

const skills = [];
for (const entry of alwaysOnSkills) {
  const skillPath = path.join(SKILLS_DIR, entry.name, "SKILL.md");
  if (!fs.existsSync(skillPath)) {
    console.log(`  ⚠ ${entry.name}/SKILL.md not found, skipping`);
    continue;
  }

  const content = fs.readFileSync(skillPath, "utf8");
  const descMatch = content.match(
    /^description:\s*>?\s*([\s\S]*?)(?:\n---|\n[a-z])/m
  );
  const description = descMatch
    ? descMatch[1].replace(/\n\s+/g, " ").trim()
    : entry.name;

  skills.push({ name: entry.name, content, description });
}

const compiled = copilot.compileAllAlwaysOn(skills);

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(OUTPUT_FILE, compiled.content, "utf8");

console.log(
  `✓ ${OUTPUT_FILE} generated (${skills.length} always-on skill(s))`
);
