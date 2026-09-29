# Using a canonical agent with Cursor

Cursor has no direct "subagent file" equivalent like Claude Code or Codex. The closest mechanism for packaging a reusable persona is a scoped Rule (`.mdc`).

## Why not duplicate

Cursor `.mdc` rules support `@file` mentions: Cursor automatically attaches that file's content to the rule's context when the rule loads. This is a native feature, not a workaround, so the rule can never drift from its source.

`description` must stay written out: it is what Cursor's agent reads to decide whether the rule is relevant, before attaching anything.

## Steps

1. Frontmatter:

   ```yaml
   ---
   description: Detailed technical planning and project tracking — use to break a feature into tasks with acceptance criteria
   alwaysApply: false
   ---
   ```

   Leave `globs` unset unless the persona should only apply to specific files.

2. Body — reference the canonical file instead of pasting it:

   ```markdown
   @../../.agents/architect.md

   Apply the persona above as-is: its Scope, Out of scope, Process and Output contract.
   ```

3. Location: `.cursor/rules/<name>.mdc`

## Usage

- **Agent-Requested**: Cursor reads `description` and decides on its own whether to load the rule
- **Manual**: mention it explicitly in chat with `@<name>`

## Difference from Claude Code / Codex

A Cursor rule injects content into the *current* agent's context — it does not run in an isolated context window like a Claude Code subagent or a Codex agent.

The `@file` syntax inside rules has behaved inconsistently across Cursor versions — verify before relying on it: https://cursor.com/docs/context/skills
