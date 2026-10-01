# SFDD - Screen-First Design and Development

## Purpose

SFDD is the working process used to define and implement TraderLab features
from the user's point of view before translating them into technical work.

The process starts with a screen, user flow or important system event. It then
identifies the user's actions, the expected behavior and the system capabilities
needed to support that experience.

SFDD is intentionally lightweight. It should create enough clarity for a human
or AI agent to implement the work consistently, without producing unnecessary
documentation or technical complexity.

## What SFDD should solve

SFDD exists to:

- Keep development focused on the user's experience.
- Make requirements understandable before coding starts.
- Expose missing capabilities, rules and system areas early.
- Reduce ambiguous instructions to AI agents.
- Avoid implementing features outside the MVP.
- Connect product expectations to the existing architecture.
- Divide implementation into small, verifiable tasks.
- Preserve the reasoning behind important implementation decisions.

## What SFDD is not

SFDD is not a replacement for the product vision, MVP definition or the
architecture guide.

It is not a requirement to create one document for every button or visual
element.

It is not a mandate to create a new module for every item discovered during
analysis.

It is not a reason to introduce abstractions before the product need is clear.

## Unit of work

The normal unit of work is a feature or user flow, not necessarily one screen.

Examples:

```text
sfdd/authentication/
sfdd/student-home/
sfdd/course-management/
sfdd/payment/
```

A screen may contain several capabilities. For example, the student home may
include notifications, profile access, course listing and content search.
These capabilities should initially be described together when they form one
user experience. They may become separate specifications later if they gain
independent rules, screens or implementation work.

## Standard artifacts

Each SFDD unit uses three Markdown files. A unit that includes a user interface
also uses a visual HTML wireframe:

```text
<feature>/
├── spec.md
├── wireframe.html
├── plan.md
└── tasks.md
```

For a process without a user interface, omit `wireframe.html`.

### `spec.md`

Describes what the user needs and how the product should behave.

It should include, when relevant:

- User profile.
- Goal of the screen or flow.
- Visible elements.
- User actions.
- Expected behaviors.
- Business rules.
- Loading, empty and error states.
- Access and permission rules.
- Acceptance criteria.
- Explicit exclusions.

The `spec.md` file should use product language and avoid unnecessary technical
details.

### `wireframe.html`

Represents the proposed screen or flow visually before production UI
implementation.

The wireframe should normally use grayscale colors, placeholder content,
visual placeholders for icons and images, realistic layout hierarchy and basic
responsive behavior when relevant. It may include simple illustrative
interactions, but it must not depend on production APIs, databases,
authentication or real data.

Use `wireframe.html` instead of documenting the wireframe only with ASCII
diagrams or Markdown. Supporting ASCII diagrams may still be used in
`spec.md` when useful.

### `plan.md`

Translates the approved specification into an implementation approach.

It should include, when relevant:

- Applications and modules affected.
- Clean Architecture layers affected.
- Frontend routes and components.
- Backend use cases and contracts.
- Repositories and external adapters.
- Data and integration needs.
- Security and authorization considerations.
- Technical risks and decisions.

The plan must respect `AGENTS.md` and the existing architecture. It should not
expand the scope without explicitly documenting the reason.

### `tasks.md`

Breaks the approved plan into small, ordered and verifiable tasks.

Tasks should be specific enough for an agent to execute without guessing. They
should identify dependencies when order matters and should include validation
tasks, not only implementation tasks.

Example:

```text
- [ ] Create the student home route.
- [ ] Implement the use case for accessible courses.
- [ ] Implement the unread notification count.
- [ ] Create the course list component.
- [ ] Add loading, empty and error states.
- [ ] Validate the acceptance criteria.
```

## SFDD workflow

```text
1. Choose a feature, screen, flow or system event.
2. Confirm that it belongs to the MVP.
3. Describe the user's goal and actions in `spec.md`.
4. Create or update the grayscale `wireframe.html` when the work includes a UI.
5. Define expected behavior, rules and acceptance criteria.
6. Review and approve the product scope and wireframe.
7. Translate the specification into `plan.md`.
8. Review the technical impact and architecture boundaries.
9. Break the plan into `tasks.md`.
10. Implement only the authorized tasks.
11. Validate the acceptance criteria and relevant tests.
12. Update the documents when the agreed behavior changes.
```

## Product-to-technical translation

SFDD uses three levels of description:

```text
User experience
    ↓
System capabilities
    ↓
Technical implementation
```

Example:

```text
User experience:
The student sees a notification icon and can open notifications.

System capabilities:
The system must know which notifications are unread and allow the student
to access only their own notifications.

Technical implementation:
Create a notification query, an unread-count use case, an authorized API
boundary and the corresponding frontend components.
```

## Rules for AI agents

Before working on an SFDD unit, the agent must:

1. Read the root `AGENTS.md`.
2. Read `traderlab_mvp.txt`.
3. Read the unit's `spec.md`.
4. Read the unit's `plan.md`, when it exists.
5. Read the unit's `tasks.md` and implement only authorized tasks.

The agent must not:

- Infer unapproved product behavior.
- Implement items explicitly excluded from the specification.
- Expand a small request into unrelated refactoring.
- Create modules only because a visual element exists.
- Move business rules into the frontend.
- Skip validation of access, permissions or security-sensitive behavior.

If the specification is ambiguous or conflicts with the architecture, the agent
must stop before implementation and report the ambiguity.

## Naming and organization

Use lowercase kebab-case for SFDD feature folders:

```text
student-home/
course-management/
payment-webhook/
```

Use exactly these file names inside each unit:

```text
spec.md
plan.md
tasks.md
```

Keep product decisions in `spec.md`, technical decisions in `plan.md` and
execution details in `tasks.md`.

## Completion standard

An SFDD unit is complete only when:

- Its acceptance criteria are satisfied.
- Relevant tests and validation have been performed.
- Authorization and access behavior have been checked.
- The implementation follows `AGENTS.md`.
- The tasks are marked complete or explicitly explained.
- The specification and plan still describe the implemented behavior.
