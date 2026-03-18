# CLAUDE.md — AI Assistant Guide for datameshdemo

This file provides context and conventions for AI assistants (Claude, Copilot, etc.) working in this repository.

---

## Project Overview

**datameshdemo** is a demonstration project for a [Data Mesh](https://martinfowler.com/articles/data-mesh-principles.html) architecture. The goal is to showcase how organizations can implement decentralized data ownership, self-serve data infrastructure, federated governance, and data as a product.

**Current state:** The repository is in its initial phase. As code is added, update this file to reflect the actual structure, tooling, and conventions in use.

---

## Repository Structure (Expected)

```
datameshdemo/
├── CLAUDE.md                  # This file
├── README.md                  # User-facing documentation
├── docker-compose.yml         # Local development environment
├── Makefile                   # Common development commands
├── .env.example               # Environment variable template
│
├── domains/                   # Data domain services (one folder per domain)
│   ├── orders/                # Example: Orders domain
│   │   ├── src/
│   │   ├── tests/
│   │   └── package.json
│   └── customers/             # Example: Customers domain
│       ├── src/
│       ├── tests/
│       └── package.json
│
├── infrastructure/            # Shared infrastructure definitions
│   ├── kafka/                 # Event streaming config
│   ├── data-catalog/          # Metadata and data discovery
│   └── observability/         # Monitoring, logging, tracing
│
├── platform/                  # Self-serve data platform components
│   ├── data-gateway/
│   └── governance/
│
└── docs/                      # Architecture decision records, diagrams
    └── adr/
```

---

## Core Data Mesh Principles (Design Guide)

All code in this repository should align with the four data mesh principles:

1. **Domain Ownership** — Data is owned and served by the domain that produces it. Each domain in `domains/` is an independent deployable unit.

2. **Data as a Product** — Each domain exposes high-quality, well-documented data products. Data products must have SLAs, schemas, and ownership information.

3. **Self-Serve Data Infrastructure** — The `platform/` layer provides reusable infrastructure so domain teams can operate independently without manual intervention.

4. **Federated Governance** — Policies (privacy, compliance, quality) are enforced globally through automation in `infrastructure/governance/`, while domains retain autonomy over their data.

---

## Development Workflows

### Prerequisites

Install the following before working on this project:

- Docker and Docker Compose
- Node.js (version from `.nvmrc` or `package.json#engines`)
- `make`

### Common Commands

```bash
# Start the full local environment
make up

# Stop and remove containers
make down

# Run all tests
make test

# Run linting
make lint

# Format code
make format

# Run a single domain's tests
make test domain=orders
```

### Environment Variables

Copy `.env.example` to `.env` and fill in required values before running locally:

```bash
cp .env.example .env
```

Never commit `.env` files. Secrets should be managed via a secrets manager in production.

---

## Code Conventions

### General

- Prefer clarity over cleverness. Code should be readable by future contributors.
- Each domain is independently versioned and deployable.
- Cross-domain communication happens only through published data products (events or APIs) — never via direct database access.

### Naming

- Directories: `kebab-case`
- Files: `kebab-case` for configs and docs, `camelCase` or `PascalCase` following the language convention for source files
- Environment variables: `SCREAMING_SNAKE_CASE`
- Event topics: `<domain>.<entity>.<event>` (e.g., `orders.order.placed`)

### Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(orders): add order placement event publisher
fix(customers): resolve null reference in profile loader
docs: update README with local setup instructions
chore(ci): upgrade Node.js version in workflow
```

Commit scopes should match domain folder names where applicable.

### Branching

- `main` — stable, always deployable
- `claude/<description>-<session-id>` — AI-assisted development branches
- `feat/<ticket-or-description>` — feature branches
- `fix/<ticket-or-description>` — bug fix branches

PRs must target `main`. Squash merges are preferred to keep history clean.

---

## Testing

- Unit tests live alongside source code in `__tests__/` or `*.test.ts` files.
- Integration tests that require running infrastructure live in a top-level `tests/integration/` directory.
- Run tests before committing. CI will block merges if tests fail.
- Test naming: describe what the unit does, not how it's implemented.

```typescript
// Good
it('returns empty array when no orders exist for customer')

// Avoid
it('calls getOrders with customerId and maps result')
```

---

## Data Product Contracts

Each domain's data products should expose:

1. **Schema** — OpenAPI spec (for REST) or Avro/JSON Schema (for events)
2. **SLA** — Availability and latency guarantees documented in the domain's README
3. **Ownership** — A `CODEOWNERS` entry and a maintainer email/team in `package.json`
4. **Data Classification** — Sensitivity level (public, internal, confidential, restricted) noted in schema metadata

---

## CI/CD

CI runs on every pull request and validates:

1. Linting passes (`make lint`)
2. Tests pass (`make test`)
3. Docker images build successfully
4. Schema changes are backwards-compatible

Deployment is triggered automatically on merge to `main` via the CD pipeline.

---

## AI Assistant Guidelines

When working as an AI assistant in this repository:

- **Read before editing.** Always read existing files before modifying them.
- **Follow domain boundaries.** Do not introduce cross-domain database dependencies.
- **Respect data product contracts.** Schema changes must be backwards-compatible unless explicitly breaking.
- **Use `make` targets.** Prefer documented `make` commands over raw shell invocations.
- **Update this file.** If you add a new domain, tool, or workflow, add it to CLAUDE.md.
- **Commit to the right branch.** Develop on `claude/` branches; never push directly to `main`.
- **Check for `.env.example` updates.** If you add a new required environment variable, add it to `.env.example` with a comment.
- **Do not over-engineer.** Implement the minimum required to satisfy the task. Avoid premature abstractions.
- **Ask before deleting.** If you need to remove a domain, table, or data product, confirm with the user first — these are hard to reverse.

---

## Resources

- [Data Mesh Principles — Martin Fowler](https://martinfowler.com/articles/data-mesh-principles.html)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Avro Schema](https://avro.apache.org/docs/current/spec.html)
- [ADR (Architecture Decision Records)](https://adr.github.io/)
