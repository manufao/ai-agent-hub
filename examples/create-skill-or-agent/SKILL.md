---
name: create-skill-or-agent
description: Explains how to add a new skill (Agent Skills format) or a new agent (canonical persona) to this repository, compatible with Claude Code, Codex CLI, Cursor and Gemini CLI. Use when packaging a new reusable expertise or persona.
---

# Create a skill or an agent in this repository

> This is an implementation **example**, not a live skill: it lives in `examples/`, outside `.agents/skills/`, so no tool discovers it and it has no wrapper or symlink.

This repository follows two distinct conventions, deliberately kept separate:

- **An agent** (`.agents/<name>.md`): a complete persona (role, scope, process) invoked explicitly or delegated to automatically. There is no common standard across tools, so each agent has one canonical file plus a small wrapper per tool that references it.
- **A skill** (`.agents/skills/<category>/<name>/SKILL.md`): a packaged expertise or procedure in the open [Agent Skills](https://agentskills.io) format. One file is enough, readable as-is by Claude Code, Codex, Cursor and Gemini CLI (all scan `.agents/skills/`, except Claude Code, see below).

## When to create a skill rather than an agent

- A procedure you repeat ("review this kind of PR", "generate this kind of report") → **skill**
- A full role with its own limits and output format, invoked like a dedicated collaborator → **agent**

## Create a skill

1. Pick an existing category (`ingenierie`, `productivite`, `marketing`) or propose a new one
2. Create `.agents/skills/<category>/<kebab-case-name>/SKILL.md`:

   ```yaml
   ---
   name: my-skill
   description: What the skill does, AND when to use it, main case first (this is the only trigger signal).
   ---

   # Skill title

   [One paragraph: what the skill does and why to package it instead of retyping the instructions each time.]

   ## When to use

   - [Concrete trigger 1]
   - [Concrete trigger 2]

   ## Instructions

   1. [Step]
   2. [Step]
   3. [Step that verifies the result]

   ## Output

   [Exact shape of what should be returned.]
   ```

3. Optional extra files: `scripts/`, `references/`, `assets/` next to `SKILL.md`, referenced by name in the body (never loaded automatically)
4. **For Claude Code only**: Claude Code does not scan `.agents/skills/`, only `.claude/skills/`. Create a symlink (once per skill):

   ```bash
   ln -s ../../.agents/skills/<category>/<name> .claude/skills/<name>
   ```

   Codex CLI, Cursor and Gemini CLI discover `.agents/skills/` natively, so they need no extra step.

## Create an agent

1. Create `.agents/<name>.md` with this structure: Role (one sentence, no "and" hiding a second role) → Scope → Out of scope → Process → Output contract
2. Keep it short and high-level — a persona that tries to cover every case becomes brittle and expensive to maintain. See [`.agents/architect.md`](../../.agents/architect.md) or [`.agents/vitest-unit-test.md`](../../.agents/vitest-unit-test.md) as examples
3. Create one wrapper per tool you use, referencing the canonical file instead of duplicating it:
   - Claude Code: `.claude/agents/<name>.md` — see [`references/how-use-agent-in-claude.md`](references/how-use-agent-in-claude.md)
   - Codex CLI: `.codex/agents/<name>.toml` — see [`references/how-use-agent-in-codex.md`](references/how-use-agent-in-codex.md)
   - Cursor: `.cursor/rules/<name>.mdc` — see [`references/how-use-agent-in-cursor.md`](references/how-use-agent-in-cursor.md)

## Before creating anything: is it really needed?

| Need | Solution |
|---|---|
| A rule that must always be enforced, no exceptions | A hook / permission rule |
| Contextual knowledge applied with judgment | A **skill** |
| A self-contained task worth its own context window | An **agent** |
| Guidance for every session in this repository | `AGENTS.md` at the root, kept short |

## Checklist before shipping

- [ ] `name` and `description` set (skill), or Role/Scope/Out of scope/Process/Output contract filled in (agent)
- [ ] `description` states clearly WHEN to use it, main case first
- [ ] Bulky content moved to a supporting file instead of inflating the main file
- [ ] Wrapper created for each targeted tool (agent), or symlink created for Claude Code (skill)
