# Repository Instructions

Node.js/TypeScript application (native HTTP server, no framework) + EJS + Tailwind CSS. It serves a site presenting the AI agents and skills defined in `.agents/`:

- `.agents/README.md` — homepage content
- `.agents/<name>.md` — an agent (canonical persona), rendered at `/agents/<name>`
- `.agents/skills/<category>/<name>/SKILL.md` — a skill in the open [Agent Skills](https://agentskills.io) format, rendered at `/skills/<category>/<name>`
- `examples/<name>/` — implementation examples (a `SKILL.md` plus `references/`), rendered at `/examples/<name>`. They live outside `.agents/skills/` on purpose: no tool discovers them and they have no wrappers or symlinks

The site UI and everything shown on it (homepage, agents, skills, examples) are in French. Repository documentation (this file, `README.md`) is in English.

Before adding an agent or a skill, read `examples/create-skill-or-agent/SKILL.md`. It documents the convention (one canonical file plus a thin wrapper per tool) that avoids duplication across Claude Code, Codex CLI, Cursor and Gemini CLI.

## Useful commands

- `pnpm run start:dev` — dev server (CSS build + hot reload)
- `make check` — format, lint, type-check, tests with coverage (100% required), build. This is the CI gate; make it pass before any PR
- `pnpm test:watch` — tests in watch mode

## Conventions

- 100% test coverage on all of `src/**/*.ts` (thresholds in `vitest.config.ts`) — every new controller/module must be tested accordingly
- No front-end framework: rendering is server-side with EJS, see `views/`
- Routing is a home-grown mini-router (`src/routing/router.ts`) with no named parameters — each controller parses `req.url` itself
- Skills are discovered natively from `.agents/skills/` by Codex CLI, Cursor and Gemini CLI. Claude Code only scans `.claude/skills/`, so each skill also needs a symlink there
