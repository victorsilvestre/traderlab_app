# TraderLab Agent Guide

## Purpose

This document guides AI agents and developers working on the TraderLab
repository. Its purpose is to preserve architectural consistency, clear
responsibilities and predictable naming across the project.

Before implementing a feature, read `traderlab_mvp.txt` and confirm that the
feature belongs to the MVP. Do not implement features listed as outside the
MVP without explicit authorization.

For feature work, follow the SFDD process documented in `sfdd/README.md`.
Start from a feature, screen, user flow or important system event, describe the
expected behavior in `spec.md`, define the technical approach in `plan.md`,
create the visual `wireframe.html` when the work includes a user interface, and
execute only the authorized work listed in `tasks.md`.

For UI work, `wireframe.html` is the standard low-fidelity visual artifact. It
should be grayscale, use placeholder content where appropriate and remain
independent from production APIs, databases and authentication.

## Project architecture

The project uses a monorepo with two applications:

```text
apps/
├── web/
└── api/
```

### `apps/web`

The web application built with Next.js. It contains pages, layouts, visual
components and user interaction for public users, students, mentors and
administrators.

### `apps/api`

The main backend built with Node.js. It contains business rules, use cases,
HTTP routes, data access and integrations with external services.

The API is a modular monolith: one backend application organized into business
modules. Do not create separate microservices for MVP features.

### `packages`

Contains code shared by more than one application. The initial shared package
is `packages/contracts`, which contains data contracts shared by the web app and
the API.

Do not place business use cases, database queries, secrets or external service
integrations in `packages`.

### `infrastructure`

Contains project-wide technical resources, such as deployment, monitoring and
local development support. Module-specific integrations belong inside the
corresponding API module, not in the root infrastructure folder.

## API module structure

Business modules are located in:

```text
apps/api/src/modules/
```

MVP modules are:

```text
authentication/
user/
course/
enrollment/
access/
payment/
progress/
notification/
audit/
```

The `access` module is responsible for authentication-related authorization and
access rules. It must distinguish at least the `student`, `mentor` and
`administrator` roles.

The administrator has full system access. The mentor is a content manager and
may create, edit, publish and unpublish courses, modules, lessons and materials,
as well as send course-related notifications and view learning progress related
to their content. The student consumes content and manages their own learning
progress.

Each module may contain these layers:

```text
domain/
application/
infrastructure/
presentation/
```

Create only the layers that are needed. Do not create empty or artificial
abstractions only to follow a template.

### `domain`

Contains the core business concepts and rules. It must not depend on Next.js,
Supabase, Mercado Pago, Brevo, HTTP or database-specific structures.

### `application`

Contains use cases: actions the system performs, such as creating an enrollment,
confirming a payment or recording lesson progress.

### `infrastructure`

Contains concrete technical implementations, such as Supabase repositories,
Mercado Pago clients, Brevo adapters and webhook integrations.

### `presentation`

Contains the API boundary: routes, controllers, request validation and response
mapping. Presentation code should delegate business work to application use
cases instead of containing business rules.

## Dependency direction

Dependencies must point inward:

```text
presentation -> application -> domain
infrastructure -> application/domain contracts
```

The domain and application layers must not import concrete infrastructure
implementations. For example, a payment use case may depend on a payment
repository contract, but it must not directly depend on Supabase.

External services are implementation details. Keep them behind adapters or
repository implementations inside the relevant module.

## Next.js conventions

Use the App Router and preserve Next.js file conventions such as `app`,
`page.tsx`, `layout.tsx`, `route.ts` and `public`.

Use route groups when organizing areas without adding them to the URL:

```text
apps/web/app/
├── (public)/
├── (student)/
└── (workspace)/
```

The `(student)` area is the student learning experience. The `(workspace)` area
is shared by mentors and administrators, but menus, routes and actions must be
filtered by the authenticated user's role.

Do not reduce the mentor experience to a single extra button inside the student
area. Mentors need a dedicated content-management workspace. Shared visual
components are encouraged, but student and workspace pages should remain
separate.

For the MVP, use the direct publishing model: mentors may publish and unpublish
their content without a separate administrator approval step. Administrators
can edit, publish, unpublish or otherwise manage any content.

Server Components are the default. Use Client Components only when interaction,
browser APIs, client state or lifecycle behavior is required.

Do not put critical authorization or access rules only in the frontend. The API
must validate authentication, authorization, role and resource ownership
independently.

## Naming conventions

Use English for folders and files throughout the codebase.

Use:

- `camelCase` for variables and functions.
- `PascalCase` for classes, types and React components.
- `kebab-case` for folders when a multi-word folder is needed.
- Clear, descriptive names instead of unexplained abbreviations.

Examples:

```text
CreateEnrollment.ts
ConfirmPayment.ts
PaymentRepository.ts
SupabasePaymentRepository.ts
```

Keep framework-required names unchanged, including `app`, `public`,
`package.json`, `tsconfig.json`, `next.config.ts` and `README.md`.

Use the product vocabulary consistently:

```text
course
lesson
enrollment
payment
subscription
progress
notification
```

Do not use a different term for the same concept in another module.

## Contracts and data boundaries

Data crossing boundaries must use simple application DTOs or contracts. Do not
pass Supabase rows, Mercado Pago response objects or framework-specific objects
directly into the domain.

Translate external data into internal application data at the infrastructure or
presentation boundary.

## Implementation discipline

- Use the SFDD process for feature work and read `sfdd/README.md` before creating
  or modifying a feature specification.
- Do not create code files before the requested architecture and scope are clear.
- Do not implement features outside the MVP without explicit authorization.
- Do not add a dependency without explaining why it is necessary.
- Do not place business rules in controllers, route handlers or React components.
- Do not access the database directly from UI components.
- Do not expose secrets or sensitive data to the browser.
- Prefer a small, understandable solution over premature abstraction.
- Add tests proportionally when implementation begins, especially for payment,
  access and enrollment rules.
- Preserve existing user changes and avoid destructive operations.

## Change checklist

Before completing a change, confirm:

1. The feature belongs to the MVP or has explicit approval.
2. The selected module is the correct business boundary.
3. Dependencies point toward the domain and application layers.
4. External services are isolated in infrastructure.
5. Authorization is enforced by the API.
6. Naming follows this guide.
7. The change does not introduce unnecessary layers or packages.
