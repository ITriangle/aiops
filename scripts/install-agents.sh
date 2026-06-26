#!/usr/bin/env bash
set -euo pipefail

# install-agents.sh — Install aiops agent definitions to AI IDEs
#
# Usage:
#   bash scripts/install-agents.sh [-g] [-a <agent>] [ide...]
#
# Options:
#   -g            Global install (default: project-local)
#   -a <agent>    Target AI IDE: claude-code, cursor, copilot, codex, all (default: all)
#   ide...        One or more: claude-code, cursor, copilot, codex
#
# Examples:
#   bash scripts/install-agents.sh -g                  # global, all IDEs
#   bash scripts/install-agents.sh -g -a cursor        # global, cursor only
#   bash scripts/install-agents.sh cursor codex         # project-local, cursor + codex

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
AGENTS_DIR="$ROOT/agents"
GLOBAL=false
TARGET_AGENT="all"
IDE_LIST=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    -g|--global) GLOBAL=true; shift ;;
    -a|--agent) TARGET_AGENT="$2"; shift 2 ;;
    -h|--help) head -17 "$0" | tail -14; exit 0 ;;
    *) IDE_LIST+=("$1"); shift ;;
  esac
done

if [[ ${#IDE_LIST[@]} -eq 0 ]]; then
  IDE_LIST=("claude-code" "cursor" "copilot" "codex")
fi

if [[ "$TARGET_AGENT" != "all" ]]; then
  IDE_LIST=("$TARGET_AGENT")
fi

# --- Check agents exist ---
if [[ ! -d "$AGENTS_DIR" ]]; then
  echo "ERROR: agents/ directory not found at $AGENTS_DIR"
  exit 1
fi

AGENT_FILES=("$AGENTS_DIR"/*.md)
if [[ ${#AGENT_FILES[@]} -eq 0 ]]; then
  echo "ERROR: no agent .md files found in $AGENTS_DIR"
  exit 1
fi

INSTALLED=0
ERRORS=0

# --- Parse agent .md into variables ---
parse_agent() {
  local file="$1"
  local name
  name="$(basename "$file" .md)"

  # Extract Identity section (first paragraph after ## Identity)
  local identity
  identity="$(awk '/^## Identity/{found=1;next} /^## /{found=0} found' "$file" | sed '/^$/d' | head -5 | tr '\n' ' ' | sed 's/  */ /g; s/^ *//;s/ *$//')"

  # Extract Constraints as bullet list
  local constraints
  constraints="$(awk '/^## Constraints/{found=1;next} /^## /{found=0} found' "$file")"

  # Extract Available Skills
  local skills
  skills="$(awk '/^## Available Skills/{found=1;next} /^## /{found=0} found' "$file")"

  # Extract Inputs
  local inputs
  inputs="$(awk '/^## Inputs/{found=1;next} /^## /{found=0} found' "$file")"

  # Extract Outputs
  local outputs
  outputs="$(awk '/^## Outputs/{found=1;next} /^## /{found=0} found' "$file")"

  # Extract Downstream
  local downstream
  downstream="$(awk '/^## Downstream/{found=1;next} /^## /{found=0} found' "$file")"

  # Build description (first sentence of identity, max 120 chars)
  local desc
  desc="$(echo "$identity" | cut -d'。' -f1 | cut -d'.' -f1 | head -c 120)"

  # Build the full prompt body (everything except Artifacts section)
  local body
  body="$(awk '
    /^## Artifacts/{skip=1;next}
    /^## [A-Z]/{if(skip && !/^## Artifacts/){skip=0}}
    !skip
  ' "$file")"

  # Export
  AGENT_NAME="$name"
  AGENT_IDENTITY="$identity"
  AGENT_DESC="$desc"
  AGENT_CONSTRAINTS="$constraints"
  AGENT_SKILLS="$skills"
  AGENT_INPUTS="$inputs"
  AGENT_OUTPUTS="$outputs"
  AGENT_DOWNSTREAM="$downstream"
  AGENT_BODY="$body"
}

# --- Generate Claude Code agent ---
generate_claude_code() {
  local dest_dir="$1"
  mkdir -p "$dest_dir"

  local file="$dest_dir/${AGENT_NAME}.md"
  cat > "$file" << EOF
---
name: ${AGENT_NAME}
description: "${AGENT_DESC}"
---

${AGENT_BODY}
EOF
  echo "  ✓ ${AGENT_NAME}.md → $file"
}

# --- Generate Cursor agent ---
generate_cursor() {
  local dest_dir="$1"
  mkdir -p "$dest_dir"

  local file="$dest_dir/${AGENT_NAME}.md"
  cat > "$file" << EOF
---
name: ${AGENT_NAME}
description: "${AGENT_DESC}"
---

${AGENT_BODY}
EOF
  echo "  ✓ ${AGENT_NAME}.md → $file"
}

# --- Generate GitHub Copilot agent ---
generate_copilot() {
  local dest_dir="$1"
  mkdir -p "$dest_dir"

  local file="$dest_dir/${AGENT_NAME}.md"
  cat > "$file" << EOF
---
name: "${AGENT_NAME}"
description: "${AGENT_DESC}"
---

${AGENT_BODY}
EOF
  echo "  ✓ ${AGENT_NAME}.md → $file"
}

# --- Generate Codex agent (TOML) ---
generate_codex() {
  local dest_dir="$1"
  mkdir -p "$dest_dir"

  local file="$dest_dir/${AGENT_NAME}.toml"

  # Escape for TOML: replace " with \" and handle multiline
  local escaped_body
  escaped_body="$(echo "$AGENT_BODY" | sed 's/\\/\\\\/g; s/"/\\"/g')"

  cat > "$file" << EOF
name = "${AGENT_NAME}"
description = "${AGENT_DESC}"
developer_instructions = """
${AGENT_BODY}
"""
EOF
  echo "  ✓ ${AGENT_NAME}.toml → $file"
}

# --- Install path resolution ---
resolve_path() {
  local ide="$1"
  if [[ "$GLOBAL" == true ]]; then
    case "$ide" in
      claude-code) echo "$HOME/.claude/agents" ;;
      cursor)      echo "$HOME/.cursor/agents" ;;
      copilot)     echo "$HOME/.github/agents" ;;
      codex)       echo "$HOME/.codex/agents" ;;
      *) echo ""; return 1 ;;
    esac
  else
    case "$ide" in
      claude-code) echo ".claude/agents" ;;
      cursor)      echo ".cursor/agents" ;;
      copilot)     echo ".github/agents" ;;
      codex)       echo ".codex/agents" ;;
      *) echo ""; return 1 ;;
    esac
  fi
}

# --- Main ---
echo "aiops agent installer"
echo "  Source: $AGENTS_DIR/"
echo "  Mode:   $(if $GLOBAL; then echo 'global'; else echo 'project-local'; fi)"
echo "  Targets: ${IDE_LIST[*]}"
echo ""

for ide in "${IDE_LIST[@]}"; do
  dest="$(resolve_path "$ide")"
  if [[ -z "$dest" ]]; then
    echo "ERROR: unknown IDE '$ide'. Use: claude-code, cursor, copilot, codex"
    ERRORS=$((ERRORS + 1))
    continue
  fi

  echo "[$ide] → $dest/"

  for agent_file in "${AGENT_FILES[@]}"; do
    parse_agent "$agent_file"
    case "$ide" in
      claude-code) generate_claude_code "$dest" ;;
      cursor)      generate_cursor "$dest" ;;
      copilot)     generate_copilot "$dest" ;;
      codex)       generate_codex "$dest" ;;
    esac
    INSTALLED=$((INSTALLED + 1))
  done
  echo ""
done

echo "Done: ${INSTALLED} agent(s) installed to ${#IDE_LIST[@]} IDE(s)"
if [[ $ERRORS -gt 0 ]]; then
  echo "  ${ERRORS} error(s)"
  exit 1
fi
