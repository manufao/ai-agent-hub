# AI Agent Hub

An open-source collection of reusable AI agents that can be shared across different projects. This repository serves as a central hub where developers can store, share, and discover AI agent configurations.

> Project bootstrapped using [create-nodejs-ts](https://github.com/vitorsalgado/create-nodejs-ts) - A starter toolkit for Node.js applications with TypeScript, testing, linting, and formatting pre-configured.

## Overview

**AI Agent Hub** provides a minimal web interface to browse and explore AI agents. Contributors can add their own agents and benefit from community contributions.

## Project Structure

```
ai-agent-hub/
├── .agents/         # Directory containing all agent definitions
├── docker/          # Docker configuration
│   ├── compose/     # Docker Compose files
│   │   ├── compose.yaml
│   │   ├── compose.debug.yaml
│   │   └── docker-compose.dev.yml
│   └── prod/        # Production environment
│       └── Dockerfile
├── docs/            # Project documentation and agent-generated plans
├── src/             # Server source code
│   ├── main.ts      # HTTP server with EJS rendering
│   ├── config.ts    # Configuration
│   └── input.css    # Tailwind CSS input
├── views/           # EJS templates
│   └── index.ejs    # Main page template
├── public/          # Static assets
│   └── css/         # Generated CSS
├── .dockerignore    # Docker ignore patterns
├── AGENTS.md        # List of available agents (displayed on web)
└── README.md        # This file
```

## Getting Started

### Prerequisites

**Option 1 - Docker (Recommended):**
- Docker
- Docker Compose

**Option 2 - Local Development:**
- Node.js (v18+)
- npm

### Quick Start with Docker

1. Clone the repository:
```bash
git clone <your-repo-url>
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
npm install
```

2. Start the development server:
```bash
npm run start:dev
```

The `start:dev` script automatically builds CSS and starts the server with hot reload.

3. Open your browser at [http://localhost:3000](http://localhost:3000)

### Other Available Commands

- `make up` - Start Docker development environment
- `make down` - Stop Docker environment
- `make clean` - Clean Docker volumes
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Server**: Native HTTP server (no Express)
- **Templating**: EJS
- **Styling**: Tailwind CSS v4
- **Markdown**: marked
- **Dev Tools**: nodemon, ESLint, Prettier, Husky, Jest

## How to Contribute

We welcome contributions! Here's how you can help:

1. Fork this repository
2. Create a new branch for your agent or feature
3. Add your agent definition to the `agents/` directory
4. Document your agent in `AGENTS.md`
5. Test your changes locally
6. Submit a pull request


## License

MIT

## Author

Emmanuel Maravilha 
