# Architect

> **Status:** Pilot
> **Version:** 1.0.0
> **Author:** AI Agent Hub
> **Created:** 2025-01-23
> **Updated:** 2025-01-23

## Description

AI agent specialized in creating detailed technical implementation plans and tracking project progress through structured markdown documentation.

### Detailed Description

The **Architect** agent combines the strategic vision of a Product Owner (30%) with deep technical architecture expertise (70%). It generates comprehensive project plans with step-by-step implementation guides, technical specifications, and clear acceptance criteria for every task. The agent maintains a living document in the `docs/` directory that tracks progress from inception to completion, then generates a retrospective report before archiving.

This agent eliminates ambiguity in project planning by providing developers with precise, actionable roadmaps that include architectural decisions, technology choices, implementation steps, and quality standards.

### Use Cases

- **New Feature Development:** Create detailed implementation plans for new features with clear technical specifications
- **System Refactoring:** Plan and track complex refactoring efforts with dependency management
- **Architecture Design:** Document architectural decisions and design patterns for new systems
- **Sprint Planning:** Generate technical breakdowns of user stories into concrete development tasks
- **Project Tracking:** Maintain a single source of truth for project status and progress

---

## AI-DLC Phase

**Current Phase:** Pilot

### Key Performance Indicators (KPIs)

- **Productivity:**
  - Reduction in planning time (target: 40% faster than manual planning)
  - Developer time saved in clarifying requirements (target: 2+ hours per feature)
  - Increased task completion rate (target: 90%+ tasks completed as planned)

- **Quality:**
  - Reduction in rework due to unclear requirements (target: 50% reduction)
  - Improved acceptance criteria clarity score (target: 4.5/5 from developers)
  - Fewer missed edge cases in implementation (target: 80% edge case coverage)

- **Satisfaction:**
  - Developer confidence in task clarity (target: 4/5 rating)
  - Time to onboard new developers to codebase (target: 30% reduction)
  - Adoption rate across development teams (target: 80% of projects)

### Identified Risks & Mitigations

- **Risk:** Over-engineering or excessive detail leading to rigid plans
  **Mitigation:** Maintain 70/30 technical/business balance, encourage iterative adjustments, keep plans focused on current phase only

- **Risk:** Plans becoming stale as project evolves
  **Mitigation:** Document includes "Notes & Decisions" section for tracking changes, encourage regular updates, treat as living document

- **Risk:** Developers skipping acceptance criteria checks
  **Mitigation:** Clear Definition of Done checklists, integration with CI/CD validation, regular review prompts

- **Risk:** Generated plans based on outdated or incorrect technology assumptions
  **Mitigation:** Temperature set to 0.3 for consistency, no hallucination policy, validation against current tech stack

---

## Configuration

### Model Settings

- **Provider:** Anthropic
- **Model:** claude-sonnet-4-5-20250929
- **Temperature:** 0.3 *(Low temperature for consistent, precise planning)*
- **Max Tokens:** 4000
- **Top P:** 1.0

### System Prompt

See [system-prompt.md](./system-prompt.md) for the complete system prompt.

**Key Directives:**
- 70% technical depth (architecture, patterns, implementation details)
- 30% business context (user value, milestones, stakeholder communication)
- Mandatory acceptance criteria for every task
- Clear Definition of Done checklists
- Dependency mapping and risk assessment
- No time estimates (focus on "what" not "when")

### Instructions

The agent follows this workflow:

1. **Analyze Project Requirements**
   - Understand the feature, problem, or system being planned
   - Identify key stakeholders and success criteria
   - Assess existing codebase and architecture constraints

2. **Design Architecture**
   - Define system components and their interactions
   - Select appropriate design patterns
   - Specify technology stack and frameworks
   - Document architectural decisions and rationale

3. **Break Down Implementation**
   - Create phases with clear objectives
   - Define granular tasks with technical details
   - Specify files to create/modify for each task
   - Include code structure suggestions

4. **Define Acceptance Criteria**
   - Write specific, measurable criteria for each task
   - Create Definition of Done checklists
   - Specify testing requirements (unit, integration, E2E)
   - Set quality standards (coverage, performance, security)

5. **Map Dependencies & Risks**
   - Identify task dependencies and execution order
   - Assess potential risks and mitigation strategies
   - Highlight technical challenges and edge cases

6. **Generate Tracking Document**
   - Create markdown file in `docs/` directory
   - Include progress tracking table
   - Add notes section for decisions and blockers
   - Set up completion criteria and archival instructions

7. **Update Progress** *(Throughout project lifecycle)*
   - Update task statuses in tracking table
   - Document decisions and changes in notes section
   - Adapt plan based on learnings

8. **Complete & Archive**
   - Generate retrospective report when all tasks done
   - Summarize what went well and learnings
   - Recommend archiving to `docs/archive/`
   - Notify developer to remove tracking file

### Examples

#### Example 1: User Authentication Feature

**Input:**
```
Create a user authentication system with email/password login and JWT tokens
```

**Expected Output:**
```markdown
# Project Plan: User Authentication System

## Executive Summary
Implement secure user authentication using email/password credentials
with JWT-based session management. Includes user registration, login,
password reset, and token refresh functionality.

## Architecture Overview

### System Components
- Authentication API (REST endpoints)
- User Database (PostgreSQL)
- JWT Token Service
- Password Hashing Service (bcrypt)
- Email Service (for password reset)

### Technology Stack
- Backend: Node.js + Express
- Database: PostgreSQL with TypeORM
- Authentication: JWT (jsonwebtoken library)
- Password Security: bcrypt
- Validation: Joi

## Implementation Plan

### Phase 1: Database & Models

#### Task 1.1: Create User Database Schema
- **Description:** Design and implement PostgreSQL schema for user storage
- **Technical Details:**
  - Create `users` table with columns: id, email, password_hash, created_at, updated_at
  - Add unique constraint on email
  - Create migration file: `migrations/001_create_users_table.ts`
  - Use TypeORM for ORM mapping
- **Acceptance Criteria:**
  - [ ] Migration successfully creates users table
  - [ ] Email field has unique constraint
  - [ ] password_hash uses VARCHAR(255)
  - [ ] Timestamps auto-populate on create/update
- **Definition of Done:**
  - [ ] Migration runs without errors
  - [ ] Down migration successfully rolls back changes
  - [ ] TypeORM entity model created
  - [ ] Unit tests for model validation
- **Dependencies:** None (foundational task)

[... continues with detailed tasks for registration endpoint,
login endpoint, JWT service, password reset, etc.]
```

**Explanation:** This plan provides concrete technical implementation steps with file names, database schemas, and specific libraries. Each task has measurable acceptance criteria and a clear Definition of Done.

#### Example 2: Handling Edge Case Planning

**Input:**
```
Plan the error handling strategy for the authentication system
```

**Expected Output:**
```markdown
### Phase 3: Error Handling & Edge Cases

#### Task 3.1: Implement Authentication Error Responses
- **Description:** Create standardized error response format for auth failures
- **Technical Details:**
  - Create `src/middleware/errorHandler.ts`
  - Define error types: InvalidCredentials, EmailAlreadyExists,
    TokenExpired, TokenInvalid, RateLimitExceeded
  - Use custom Error classes extending base Error
  - Return consistent JSON structure: { error, message, statusCode }
- **Acceptance Criteria:**
  - [ ] Invalid login returns 401 with "Invalid credentials" message
  - [ ] Duplicate email returns 409 with "Email already registered"
  - [ ] Expired token returns 401 with "Token expired"
  - [ ] Rate limit returns 429 with "Too many requests"
  - [ ] All error responses include request_id for debugging
- **Definition of Done:**
  - [ ] Error middleware catches all auth errors
  - [ ] HTTP status codes align with REST conventions
  - [ ] Error messages are user-friendly (no stack traces)
  - [ ] Errors logged to monitoring system
  - [ ] Unit tests for each error type
- **Dependencies:** Task 2.1 (Login Endpoint), Task 2.2 (Registration)
```

---

## Tools & Integrations

### Required Tools

- **Markdown Renderer:** For displaying generated plans in IDEs or browsers
- **File System Access:** To create and update tracking documents in `docs/`

### Optional Tools

- **Git Integration:** For tracking document changes and collaboration
- **CI/CD Integration:** To validate acceptance criteria automatically
- **Project Management Tools:** Export tasks to Jira, Linear, or GitHub Issues

### External APIs

None required. The agent operates independently using only file system access.

---

## Context Management

### Context Window

- **Max History:** Full project context (requirements, existing architecture, constraints)
- **Include System Info:** Yes (tech stack, file structure, existing patterns)
- **Custom Context:** User's specific project requirements, team conventions, existing documentation

### Memory Strategy

- **Session-based memory:** Maintains context within a single planning session
- **Long-term storage:** The generated markdown document serves as persistent memory
- **Context pruning:** Agent focuses on current phase; completed phases summarized

---

## Deployment

### Environment Requirements

- **Memory:** 1GB minimum (for processing large codebases)
- **CPU:** 1 core minimum
- **Storage:** Minimal (markdown files only)
- **Environment Variables:**
  - `ANTHROPIC_API_KEY` - Authentication for Claude API
  - `MODEL_NAME` - claude-sonnet-4-5-20250929
  - `OUTPUT_DIR` - Path to docs directory (default: `./docs`)

### Integration Points

- **File System:** Reads project structure, writes to `docs/` directory
- **CLI Interface:** Can be invoked via command line or IDE integration
- **API Endpoint:** Optional REST API for programmatic access

### Authentication

- **Method:** API Key (for Claude API access)
- **Scope:** File read/write permissions for docs directory
- **Rate Limiting:** Follows Anthropic API limits

---

## Monitoring & Observability

### Metrics to Track

- **Document Generation Time:** Target < 30 seconds for standard features
- **Plan Accuracy:** Percentage of tasks completed without major revisions (target > 80%)
- **Developer Satisfaction:** Rating from developers using the plans (target > 4/5)
- **Adoption Rate:** Percentage of projects using Architect (target > 80%)
- **Retrospective Completion:** Percentage of projects with final reports (target > 70%)

### Alerts & Notifications

- **Long Generation Time:** Alert if plan takes > 60 seconds
- **Incomplete Plans:** Warn if acceptance criteria missing from tasks
- **Stale Documents:** Notify if tracking document not updated in 7 days

### Logging

- **Log Level:** INFO
- **Include:** Request timestamp, project name, document path, token usage
- **Retention:** 90 days
- **Privacy:** No sensitive code or business logic logged

---

## Testing

### Unit Tests

#### Test 1: Plan Generation Format
- **Input:** Simple feature request ("Add search functionality")
- **Expected:** Valid markdown document with all required sections
- **Assertions:**
  - Document includes Executive Summary
  - At least one phase with tasks defined
  - Every task has acceptance criteria
  - Progress tracking table present

#### Test 2: Acceptance Criteria Quality
- **Input:** Complex feature with edge cases
- **Expected:** Specific, measurable acceptance criteria (no vague statements)
- **Assertions:**
  - No criteria like "works well" or "good quality"
  - All criteria include observable outcomes
  - Technical metrics specified (e.g., "response time < 200ms")

### Integration Tests

#### Test 1: File Creation and Updates
- **Setup:** Clean docs directory
- **Scenario:** Generate plan, update progress, complete project
- **Expected:**
  - File created in `docs/`
  - Progress table updates correctly
  - Retrospective generated on completion
  - Archive recommendation included

### Performance Benchmarks

- **Response Time:** p50 < 15s, p95 < 30s, p99 < 60s
- **Token Efficiency:** Average 2500-3500 tokens per plan
- **Document Quality:** 90%+ of developers rate clarity as 4+/5

---

## Governance & Compliance

### Data Handling

- **PII Allowed:** No (plans should not include personal data)
- **Data Retention:** Documents retained until archived by developer
- **Encryption:** Not required (plans are non-sensitive technical documentation)
- **Anonymization:** No user-specific data in plans

### Compliance Standards

- General software development best practices
- No specific compliance requirements (pilot phase)
- Follows AI-DLC methodology principles

### Access Control

- **Roles:** Developer, Technical Lead, Product Owner
- **Permissions:**
  - **Developer:** Create plans, update progress, archive documents
  - **Technical Lead:** Review plans, approve architectures
  - **Product Owner:** Review business context, validate milestones

### Audit Logging

All plan generation events logged:
- Developer who requested plan
- Timestamp of creation
- Feature/project name
- Document path
- Updates and completion events

---

## Documentation & Resources

### Related Documentation

- [System Prompt](./system-prompt.md) - Complete agent instructions
- [Agent Configuration](./agent.json) - Model settings and parameters
- [AI-DLC Methodology](../../docs/AI-DLC.md) - Framework overview

### Examples & Tutorials

**Example Project Plans:**
- User Authentication System
- E-commerce Shopping Cart
- Real-time Chat Feature
- Database Migration Strategy
- API Versioning Implementation

### Troubleshooting

#### Common Issue 1
**Problem:** Generated plan is too high-level and lacks technical details
**Solution:** Verify temperature is set to 0.3, provide more context about existing architecture, explicitly request technical specifics in prompt

#### Common Issue 2
**Problem:** Acceptance criteria are vague or unmeasurable
**Solution:** Review system prompt examples, ensure "no hallucination" constraint is enforced, provide sample acceptance criteria format

#### Common Issue 3
**Problem:** Tracking document becomes outdated and isn't maintained
**Solution:** Set reminders to update progress weekly, integrate with CI/CD to auto-update on task completion, assign ownership of document

---

## Version History

### v1.0.0 (2025-01-23)
- Initial pilot release
- Core planning functionality
- Acceptance criteria generation
- Progress tracking tables
- Retrospective report generation
- Archive workflow

### v1.1.0 (Future)
- CI/CD integration for automated acceptance criteria validation
- Export to project management tools (Jira, Linear, GitHub)
- Template customization per project type
- Multi-language support for international teams
- Metrics dashboard for plan quality tracking

---

## Contributing

To improve this agent:

1. Test in pilot projects and gather developer feedback
2. Document any edge cases or limitations discovered
3. Suggest improvements to system prompt or configuration
4. Submit examples of successful plans generated
5. Report issues via project repository

**Feedback Template:**
- What worked well
- What could be improved
- Specific scenarios where agent struggled
- Suggested prompt refinements

---

## License

MIT License - See [LICENSE](../../LICENSE) for details

---

## Tags

`#ai-agent` `#planning` `#architecture` `#project-management` `#technical-documentation` `#ai-dlc-pilot` `#acceptance-criteria` `#progress-tracking`

---

*This agent follows the [AI-DLC methodology](../../docs/AI-DLC.md) for structured AI integration in software development*
