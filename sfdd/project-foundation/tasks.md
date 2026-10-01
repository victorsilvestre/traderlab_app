# Project Foundation — Tasks

## Workspace

- [ ] Configure the root package manager as pnpm.
- [ ] Configure the pnpm workspace for `apps/*` and `packages/*`.
- [ ] Define root scripts for development and validation.
- [ ] Confirm that workspace dependencies resolve correctly.

## Web application

- [ ] Configure the Next.js application in `apps/web`.
- [ ] Enable TypeScript and App Router conventions.
- [ ] Preserve the planned route groups for public, student and workspace areas.
- [ ] Add the minimum startup surface required to run the application.
- [ ] Confirm that the web application starts locally.

## API application

- [ ] Configure the Fastify application in `apps/api`.
- [ ] Configure TypeScript for the API.
- [ ] Add the minimum server startup behavior.
- [ ] Preserve the `src/modules`, `src/shared` and `src/config` boundaries.
- [ ] Confirm that the API starts independently from the web application.

## Shared contracts

- [ ] Configure `packages/contracts` as a workspace package.
- [ ] Configure its TypeScript entry point.
- [ ] Confirm that the web application can import the package.
- [ ] Confirm that the API can import the package.
- [ ] Keep the package free from framework and database dependencies.

## Code quality

- [ ] Configure ESLint.
- [ ] Configure Prettier.
- [ ] Add type-checking scripts.
- [ ] Add lint scripts.
- [ ] Add formatting-check scripts.
- [ ] Confirm that the commands run successfully.

## Tests

- [ ] Configure Vitest.
- [ ] Add the minimum test configuration needed by the workspace.
- [ ] Add a foundation-level smoke test where useful.
- [ ] Confirm that tests run from the repository root.

## Environment

- [ ] Define the environment variable names required by the initial applications.
- [ ] Create an environment example without real credentials.
- [ ] Separate public web variables from server-only API variables.
- [ ] Confirm that secrets are not committed or exposed to the web bundle.

## Validation

- [ ] Run the web development command.
- [ ] Run the API development command.
- [ ] Run type checking.
- [ ] Run linting.
- [ ] Run formatting checks.
- [ ] Run tests.
- [ ] Run the available build validation.
- [ ] Confirm that no product feature was implemented during foundation setup.
