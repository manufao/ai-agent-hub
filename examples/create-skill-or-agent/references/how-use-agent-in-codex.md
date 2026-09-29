# Using a canonical agent with Codex CLI

How to turn a canonical persona (`.agents/<name>.md`) into a Codex CLI custom agent **without copying its content**.

## Why not duplicate

TOML has no file-include syntax, but Codex can read repository files: `developer_instructions` can be limited to an instruction to read the canonical file, instead of maintaining a copy.

`name` and `description` stay written out: they let you invoke the agent by name and tell Codex when it is relevant, before any file is read.

## Steps

```toml
name = "architect"
description = "Detailed technical planning and project tracking"

developer_instructions = """
Read and apply the persona defined in .agents/architect.md before doing anything else. Follow its Scope, Out of scope, Process and Output contract exactly.
"""
```

Location: `.codex/agents/<name>.toml` (project) or `~/.codex/agents/<name>.toml` (global).

## Usage

Codex does not delegate automatically the way Claude Code does. Invoke the agent explicitly by its `name`, in a prompt or in `AGENTS.md`: *"Ask `architect` to break this feature down"*.

Source — check current field names before relying on this: https://developers.openai.com/codex/subagents
