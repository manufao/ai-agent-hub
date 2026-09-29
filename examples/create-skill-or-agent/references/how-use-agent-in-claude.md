# Using a canonical agent with Claude Code

How to turn a canonical persona (`.agents/<name>.md`) into a Claude Code subagent **without copying its content**.

## Why not duplicate

Claude Code has no include syntax for a subagent's body. But the agent has the `Read` tool, so the wrapper can simply tell it to read the canonical file itself instead of maintaining a copy.

Only `description` (and `name`) must be written out in the wrapper: it is the only signal Claude uses to decide whether to delegate to this agent automatically, before it has read any file.

## Steps

1. YAML frontmatter, with an explicit `description`:

   ```yaml
   ---
   name: architect
   description: Detailed technical planning and project tracking. Use to break a feature into tasks with acceptance criteria.
   tools: Read, Write
   model: inherit
   ---
   ```

2. Body: a single line pointing at the canonical file, nothing more:

   ```markdown
   Read and apply the persona defined in `.agents/architect.md`. Follow its Scope, Out of scope, Process and Output contract exactly.
   ```

3. Location: `.claude/agents/<name>.md` (shared with the team through git) or `~/.claude/agents/<name>.md` (personal).

## Usage

- Claude can delegate automatically by reading `description`
- Or invoke it explicitly: "Use the `architect` agent to..."
- On startup the agent first reads the canonical file, then applies it — one extra tool call, but the persona never drifts between wrapper and source

Source — check current field names before relying on this: https://code.claude.com/docs/en/sub-agents
