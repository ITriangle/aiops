#!/usr/bin/env node
// build-windsurf-rules.js — Generate .windsurf/rules/*.mdc from always-on skills
//
// Usage: node scripts/build/build-windsurf-rules.js
// Output: .windsurf/rules/lean.mdc at repo root

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const SKILLS_DIR = path.join(ROOT, "skills");
const MANIFEST_PATH = path.join(SKILLS_DIR, "manifest.json");
const OUTPUT_DIR = path.join(ROOT, ".windsurf", "rules");

const { getAdapter } = require("../adapters");
const windsurf = getAdapter("windsurf");

// ─── Load always-on skills ─────────────────────────────────────────────────

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
const alwaysOnSkills = (manifest.tier1 || []).filter((s) => s.alwaysOn);

if (alwaysOnSkills.length === 0) {
  console.log("No alwaysOn skills found in manifest. Nothing to generate.");
  process.exit(0);
}

// ─── Generate .mdc files ───────────────────────────────────────────────────

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

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

  const compiled = windsurf.compileAlwaysOn({
    name: entry.name,
    content,
    description,
  });

  fs.writeFileSync(
    path.join(OUTPUT_DIR, compiled.filename),
    compiled.content,
    "utf8"
  );
  console.log(`  ✓ .windsurf/rules/${compiled.filename}`);
}

console.log(
  `✓ ${alwaysOnSkills.length} windsurf rule(s) generated → ${OUTPUT_DIR}`
);
