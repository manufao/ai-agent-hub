# Agent plans

Blueprint, Forge, Pulse and Specimen plan the work before any code is written. Their plans are saved here so the decisions stay in git, next to the code they led to, instead of living only in a chat session.

One folder per subject, named `YYYY-MM-DD-<subject>`, holding one file per agent: `architecture.md` (Blueprint), `implementation.md` (Forge), `observability.md` (Pulse) and `tests.md` (Specimen).

The conventions (naming, header, `## Décisions` section, language) live in the skill `docs-plans`, so they travel with the agents to other repositories: see `.agents/skills/ingenierie/docs-plans/SKILL.md`.
