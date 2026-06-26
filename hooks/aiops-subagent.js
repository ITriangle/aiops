#!/usr/bin/env node
// aiops — SubagentStart hook
//
// Ensures subagents spawned during a session inherit lean discipline.
// Emits a compact reminder (not the full skill) to minimize token overhead.

"use strict";

const output = `## aiops subagent context

You are a subagent within an aiops-managed session. Inherit these rules:

**Lean ladder** — stop at the first rung that holds:
1. Does this need to exist? (YAGNI)
2. Stdlib does it?
3. Native platform feature?
4. Already-installed dependency?
5. One line?
6. Minimum code that works

**Rules**: No unrequested abstractions. Deletion over addition. Shortest working diff.

**Never cut**: Trust-boundary validation, data-loss prevention, security, accessibility, explicitly requested behavior.`;

try {
  process.stdout.write(output);
} catch {
  // Silent fail
}
