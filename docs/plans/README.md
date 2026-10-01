# Agent plans

Forge, Pulse and Specimen plan the work before any code is written. Their plans are saved here so the decisions stay in git, next to the code they led to, instead of living only in a chat session.

## Layout

One folder per subject, named `YYYY-MM-DD-<subject>` (date the plan was written, subject in a few kebab-case words):

```text
docs/plans/2026-10-02-observabilite/
├── implementation.md   # Forge   - ordered implementation plan
├── observability.md    # Pulse   - failure scenarios, signals, actions
└── tests.md            # Specimen - test strategy
```

Each agent writes only its own file, and only when it is called: a small change usually has just `implementation.md`.

## Conventions

- **Language**: plans are written in French, like the agents' own output
- **Header**: start with a title, then one line with the agent, the date and the branch or PR when known
- **Decisions**: when the user decides something that changes the plan (an option picked, a scope cut), add it to the file in a `## Décisions` section. A plan that was followed and a plan that was changed must both be readable afterwards
- **Keep them**: plans stay in git after delivery. They are the history of why, not a to-do list
- **Do not duplicate**: link to ADRs, issues and PRs instead of copying them

## What this is not

The agents can write any file with their `Write` tool; the rule "only under `docs/plans/`" is in their persona, not enforced by the tooling. Review the diff of a plan commit like any other.
