# Project Foundation — Specification

## Objective

Prepare the TraderLab repository to receive and execute product features with
a consistent technical foundation.

This work establishes the monorepo, the web application, the API application,
shared contracts and the basic development quality tools. It does not implement
business functionality.

## Scope

The foundation must provide:

- A pnpm workspace monorepo.
- A Next.js web application using the App Router.
- A Node.js API application using Fastify and TypeScript.
- A shared contracts package.
- TypeScript configuration shared where appropriate.
- ESLint and Prettier configuration.
- A test setup using Vitest.
- Development scripts for the web application and API.
- Environment variable examples without real secrets.
- Basic build and validation commands.
- A clear separation between web, API and shared packages.

## Applications

### Web application

Located at `apps/web`.

Responsible for the Next.js user interface, routes, layouts and frontend
interaction.

### API application

Located at `apps/api`.

Responsible for the Fastify HTTP server and the future backend modules. The API
must be able to start independently from the web application.

### Shared contracts

Located at `packages/contracts`.

Responsible only for data contracts and types that must be shared between the
web application and the API. It must not contain business use cases, database
access or secrets.

## Technology decisions

- Package manager: pnpm.
- Language: TypeScript.
- Frontend: Next.js with App Router.
- Backend: Node.js with Fastify.
- Tests: Vitest.
- Code quality: ESLint and Prettier.
- Authentication and database provider: Supabase, prepared but not fully
  implemented as part of this foundation.
- Deployment: kept compatible with a monorepo; final API hosting decision is
  deferred.

## Non-goals

This foundation must not implement:

- Login or authentication flows.
- Supabase authentication integration.
- Database schema or migrations.
- Course, enrollment, payment or progress behavior.
- Business entities or use cases.
- Real external service integrations.
- Production deployment.
- User-facing product screens beyond the minimum application startup surface.

## Expected result

At the end of this work:

- The repository has the agreed monorepo structure.
- The web application can start locally.
- The API can start locally.
- The shared contracts package can be imported by the applications.
- Type checking can run.
- Linting can run.
- Formatting can be checked.
- Tests can run.
- Build or equivalent validation commands are defined.
- No real credentials are committed.

## Acceptance criteria

- The project uses pnpm workspace configuration.
- `apps/web` and `apps/api` are separate applications in the same repository.
- `apps/web` uses Next.js App Router conventions.
- `apps/api` starts as an independent Fastify application.
- TypeScript is configured for the applications and shared package.
- ESLint and Prettier are available through project scripts.
- Vitest is available through project scripts.
- An environment example documents required variable names without values.
- The repository can be validated without implementing a product feature.
