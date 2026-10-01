# AI Agent Hub

An open-source collection of reusable AI agents that can be shared across different projects. This repository serves as a central hub where developers can store, share, and discover AI agent configurations.

> Project bootstrapped using [create-nodejs-ts](https://github.com/vitorsalgado/create-nodejs-ts) - A starter toolkit for Node.js applications with TypeScript, testing, linting, and formatting pre-configured.

## Overview

**AI Agent Hub** provides a web interface to browse and explore AI agents and skills, organized by category with a sidebar navigation. Contributors can add their own agents and skills and benefit from community contributions. See `.agents/README.md` for the site's own overview, and `examples/create-skill-or-agent/SKILL.md` for how to contribute one.

## Project Structure

```
ai-agent-hub/
├── .agents/         # Agent personas (<name>.md) and skills (skills/<category>/<name>/SKILL.md)
├── docker/          # Docker configuration
│   ├── compose/     # Docker Compose files
│   │   └── docker-compose.dev.yml
│   └── prod/        # Production environment
│       └── Dockerfile
├── docs/            # Project documentation and agent-generated plans
├── examples/        # Implementation examples (skill + references), not wired to any tool
├── .claude/         # Claude Code wrappers: agents/ (personas), plus skills/ symlinks for real skills
├── .codex/          # Codex CLI wrappers: agents/*.toml
├── .cursor/         # Cursor wrappers: rules/*.mdc
├── src/             # Server source code
│   ├── main.ts      # HTTP server
│   ├── config.ts    # Configuration
│   ├── view.ts      # Shared page renderer (sidebar layout)
│   ├── content/     # Loaders for agents, skills and overview (read from .agents/)
│   ├── controllers/ # Home, agent, skills, static and health controllers
│   ├── http/        # Static 404 and 500 pages
│   ├── logging/     # Structured logger (pino) and log helpers
│   ├── routing/     # Minimal router and route table
│   ├── start.ts     # Startup checks, then listen
│   └── input.css    # Tailwind CSS input
├── views/           # EJS templates
│   └── index.ejs    # Site layout (sidebar + content)
├── public/          # Static assets
│   └── css/         # Generated CSS
├── .dockerignore    # Docker ignore patterns
├── AGENTS.md        # Repo-wide instructions for coding agents (Claude Code, Codex, ...)
└── README.md        # This file
```

## Getting Started

### Prerequisites

**Option 1 - Docker (Recommended):**
- Docker
- Docker Compose

**Option 2 - Local Development:**
- Node.js (v24+)
- pnpm (v12+)

### Quick Start with Docker

1. Clone the repository:
```bash
git clone https://github.com/manufao/ai-agent-hub.git
cd ai-agent-hub
```

2. Start the development environment:
```bash
make up
```

Or using docker compose directly:
```bash
docker compose -f ./docker/compose/docker-compose.dev.yml up
```

3. Open your browser at [http://localhost:3000](http://localhost:3000)

The Docker setup automatically:
- Installs all dependencies
- Builds Tailwind CSS
- Starts the development server with hot reload
- Watches for file changes

**Stop the server:**
```bash
make down
```

### Local Development (without Docker)

If you prefer to run without Docker:

1. Install dependencies:
```bash
pnpm install
```

2. Start the development server:
```bash
pnpm run start:dev
```

The `start:dev` script automatically builds CSS and starts the server with hot reload.

3. Open your browser at [http://localhost:3000](http://localhost:3000)

### Site Pages

Once the server is running:

- `/` - Overview (`.agents/README.md`)
- `/agents/<name>` - An agent persona (`.agents/<name>.md`)
- `/skills`, `/skills/<category>`, `/skills/<category>/<name>` - Skills, grouped by category
- `/examples/<name>` - Implementation examples (`examples/<name>/SKILL.md`)
- `/health` - Health check: `200 ok` when `.agents/` is readable, `503` otherwise

### Other Available Commands

- `make check` - Run every CI check (format, lint, types, coverage, build, audit)
- `make up` - Start Docker development environment
- `make down` - Stop Docker environment
- `make clean` - Clean Docker volumes
- `pnpm run build` - Build for production
- `pnpm test` - Run tests
- `pnpm run test:watch` - Run tests in watch mode
- `pnpm run test:types` - Type-check sources and tests
- `pnpm run lint` - Lint code
- `pnpm run format` - Format code with Prettier
- `pnpm run security:check` - Run dependency audit and secret scan

### Observability and troubleshooting

The server writes one JSON line per event on stdout (`docker compose logs` or `pnpm start`). Set `LOG_LEVEL` (`debug`, `info`, `warn`, `error`, `silent`; default `info`) to change the verbosity. Logs never contain user-supplied values or file contents: a 404 is logged with its route family only, and a request URL is logged without its query string.

| Event | Level | Meaning | What to do |
| --- | --- | --- | --- |
| `startup.listening` | info | The server is up | Nothing |
| `startup.port_in_use` | error | The port is already taken | Stop the other process or change `PORT` |
| `startup.invalid_port` | error | `PORT` is not an integer between 0 and 65535 | Fix `PORT` |
| `startup.content_dir_missing` | error | `.agents/`, `.agents/skills/` or `examples/` is missing (see `missing`) | Restore the folder; the server did not start |
| `content.unreadable` | error | A content file cannot be read (see `file`); the site skips it and keeps running | Fix the permissions or the file |
| `content.frontmatter_invalid` | warn | A frontmatter block is opened with `---` but never closed (see `file`) | Close it with `---` |
| `http.not_found` | info | A page does not exist (see `route`) | Nothing if isolated; look for a broken link if frequent |
| `http.unhandled` | error | An unexpected error; the visitor got a generic 500 page (stack in `err`) | Read the stack, reproduce with the logged `url` |

The two content events are logged once per file until the server restarts. Out of scope for now: response-time metrics and alerting, which only make sense once the site is deployed and monitored.

## Technology Stack

- **Runtime**: Node.js 24 with TypeScript 6
- **Server**: Native HTTP server (no Express)
- **Templating**: EJS 6
- **Styling**: Tailwind CSS v4
- **Markdown**: marked 18
- **Logging**: pino 10 (JSON lines on stdout)
- **Testing**: Vitest 5
- **Linting**: ESLint 10 with typescript-eslint 8 (flat config)
- **Formatting**: Prettier 3
- **Git Hooks**: Husky 9, lint-staged 17, commitlint 21
- **Dev Server**: tsx
- **Package Manager**: pnpm 12
- **Security**: pnpm audit, Gitleaks (secret scanning), Semgrep (SAST), OWASP ZAP (DAST)

## How to Contribute

We welcome contributions! Here's how you can help:

1. Fork this repository
2. Create a new branch for your agent or skill
3. Follow `examples/create-skill-or-agent/SKILL.md` to add a new agent (`.agents/<name>.md`) or skill (`.agents/skills/<category>/<name>/SKILL.md`)
4. Test your changes locally
5. Submit a pull request


## License

MIT

## Author

Emmanuel Maravilha 
