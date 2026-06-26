#!/usr/bin/env node
// build-agents-md.js — Generate AGENTS.md from agents/*.md + manifest.json
//
// Usage: node scripts/build/build-agents-md.js
// Output: AGENTS.md at repo root

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const AGENTS_DIR = path.join(ROOT, "agents");
const MANIFEST_PATH = path.join(ROOT, "skills", "manifest.json");
const OUTPUT_PATH = path.join(ROOT, "AGENTS.md");

// ─── Load manifest ─────────────────────────────────────────────────────────

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));

// ─── Load agent definitions ────────────────────────────────────────────────

const agents = fs
  .readdirSync(AGENTS_DIR)
  .filter((f) => f.endsWith(".md"))
  .map((f) => {
    const name = path.basename(f, ".md");
    const content = fs.readFileSync(path.join(AGENTS_DIR, f), "utf8");

    // Extract Identity section
    const identityMatch = content.match(/## Identity\n\n(.+?)(?:\n\n)/s);
    const identity = identityMatch ? identityMatch[1].trim() : "";

    // Extract Skills section
    const skillsMatch = content.match(/## Skills\n\n([\s\S]*?)(?:\n\n## |\n$)/);
    const skills = skillsMatch ? skillsMatch[1].trim() : "";

    // Find manifest entry for dispatch info
    const manifestEntry = (manifest.agents || []).find((a) => a.name === name);

    return { name, identity, skills, manifestEntry };
  });

// ─── Generate AGENTS.md ────────────────────────────────────────────────────

const dispatchTable = `
| Task type | Grill | Prototype verdict | Ends at |
| --- | --- | --- | --- |
| Feature | yes | only if /prototype ran | /aiops-implement |
| Bug | no | no | /aiops-implement |
| Incoming | only if still unclear after triage | no | /aiops-implement |
| Architecture health | yes (you pick the item) | only if /prototype ran | /aiops-implement |
`;

const agentSections = agents
  .map((a) => {
    const role = a.manifestEntry ? a.manifestEntry.role : "unknown";
    const outputs = a.manifestEntry
      ? a.manifestEntry.outputs.join(", ")
      : "—";
    return `### ${a.name}

**Role**: ${role}
**Outputs**: ${outputs}

${a.identity}
`;
  })
  .join("\n");

const leanLadder = `1. Does this need to exist? (YAGNI)
2. Stdlib does it?
3. Native platform feature?
4. Already-installed dependency?
5. One line?
6. Minimum code that works`;

const agentsMd = `# aiops — Agent Definitions

Lazy means efficient, not careless. The best code is the code never written.

## Lean Discipline

Before writing any code, stop at the first rung that holds:

${leanLadder}

**Rules**: No unrequested abstractions. Deletion over addition; shortest working diff. Mark deliberate shortcuts with \`// lean: <ceiling and upgrade path>\`.

**Never cut**: Trust-boundary validation, data-loss prevention, security, accessibility, explicitly requested behavior.

## Delivery Sequence

Inside \`/aiops-implement\`: lean ladder → \`/tdd\` → \`/prune\` → \`/review\` → commit only on user approval.

## Dispatch by Task Type

${dispatchTable}

## Agents

${agentSections}
`;

// ─── Write output ──────────────────────────────────────────────────────────

fs.writeFileSync(OUTPUT_PATH, agentsMd, "utf8");
console.log(`✓ AGENTS.md generated (${agents.length} agents, ${OUTPUT_PATH})`);
