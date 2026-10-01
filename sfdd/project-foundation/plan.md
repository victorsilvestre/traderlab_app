# Project Foundation — Technical Plan

## Architecture impact

This work prepares the repository boundaries without implementing domain
behavior.

```text
apps/web              Next.js application
apps/api              Fastify API application
packages/contracts    Shared data contracts
infrastructure        Project-wide technical support
sfdd                  Product and implementation specifications
```

## Repository setup

Configure the root as a pnpm workspace. The root should provide scripts that
can run common validation tasks across the workspace without hiding which
application produced an error.

Each application and package should have its own package boundary and clear
dependency list.

## Web application

Configure `apps/web` as a Next.js App Router application with TypeScript.
Preserve Next.js conventions such as `app`, `public`, `page`, `layout` and
configuration files.

The web application must not contain API business rules or direct database
access.

## API application

Configure `apps/api` as a standalone Fastify application with TypeScript.

The initial server should only expose the minimum startup behavior needed to
prove that the API is running. Product routes, authentication routes and
business modules are outside this foundation.

The API structure must remain ready for the existing modular Clean Architecture:

```text
src/
├── modules/
├── shared/
└── config/
```

Do not add domain entities or use cases during this setup.

## Shared contracts

Configure `packages/contracts` as an importable workspace package.

It may contain only neutral TypeScript contracts and types. It must not import
Next.js, Fastify, Supabase or database clients.

## TypeScript

Use strict TypeScript settings where compatible with the selected frameworks.
Keep application-specific compiler settings close to each application while
sharing only genuinely common settings.

Avoid creating path aliases that make dependencies unclear. Any alias must be
documented and must not allow inner architecture layers to import outer
infrastructure accidentally.

## Quality tools

Configure common commands for:

- Development.
- Type checking.
- Linting.
- Formatting check.
- Tests.
- Build or compile validation.

The exact command names should be consistent across the repository whenever
possible.

## Environment configuration

Create an environment example with variable names only. Separate public web
variables from server-only API variables.

Never expose service-role keys, private tokens or other secrets to the web
application.

The Supabase integration should be prepared through configuration boundaries,
but its authentication and database behavior belong to later SFDD units.

## Testing approach

Configure Vitest so tests can be added to the API, shared contracts and future
domain modules.

The foundation itself should validate startup and configuration where practical,
but it does not require product behavior tests.

## Deployment constraint

Keep the repository compatible with one GitHub repository and a monorepo deploy
model. Do not finalize whether the API will use Vercel or another provider in
this task.

## Risks and decisions

- Avoid adding a second backend framework on top of Fastify.
- Avoid adding a database client before the relevant product feature exists.
- Avoid creating business abstractions with no current use.
- Avoid making deployment configuration block local development.
- Keep web and API independently runnable.
