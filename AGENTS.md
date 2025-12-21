# AI Agent Hub

Welcome to the **AI Agent Hub** - an open-source collection of reusable AI agents for various projects.

## Available Agents

### 🏗️ Architect
**Status:** Pilot | **Version:** 1.0.0

AI agent specialized in creating detailed technical implementation plans and tracking project progress through structured markdown documentation.

**Key Features:**
- 70% technical depth (architecture, patterns, implementation details)
- 30% business context (user value, milestones)
- Acceptance criteria generation for every task
- Progress tracking with Definition of Done checklists
- Retrospective reports on completion
- Automatic archival workflow

**Use Cases:**
- New feature development planning
- System refactoring roadmaps
- Architecture design documentation
- Sprint planning with technical breakdowns
- Project tracking and progress monitoring

**Output:** Markdown files in `docs/` directory with complete project plans

🤖 **[System Prompt](./.agents/architect/system-prompt.md)**

---

### 🧪 Vitest Unit Test Agent

**Trigger:** Test creation, coverage improvement, test refactoring
**Context:** Svelte 5 components, utility functions, existing test suite
**Output:** .test.ts files with 100% coverage

**When to use:**

- User asks to create/write tests
- User mentions "coverage", "testing", "unit test"
- After implementing new features that need tests
- When refactoring tests for pattern consistency

**Key capabilities:**

- Automated 4-step workflow (format → test → coverage → full suite check)
- 100% coverage enforcement (all metrics)
- BDD pattern with Given/When/Then
- i18n testing without mocks

📄 **[System Prompt](./.agents/vitest-unit-test/vitest-unit-test.md)**

---

### Coming Soon!

More agents are being developed and will be added to this library.
