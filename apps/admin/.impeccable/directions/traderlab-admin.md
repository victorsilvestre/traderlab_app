# Direction contract — TraderLab Gestão admin

## Approved direction

**Guia prático do TraderLab** — a picked direction for a code-led Operate redesign.
Treat each management task like a clear step in a practical field guide: one
recognizable workspace, section markers at page starts, orderly tables, and
states that can be scanned without adding new actions or data.

## Product truth and scope

- Audience: mentors and administrators in the existing management workspace.
- Scope: visual layout of current admin routes, especially courses, students,
  banners, and notifications. Keep all current routes, actions, content, data,
  access rules, and role filtering intact.
- Keep the left navigation as the persistent map. On narrow screens it may
  become a horizontally scrollable navigation row.
- Use Roboto Serif for page and section headings; use Roboto for controls,
  tables, body copy, and account details.
- Use the official TraderLab palette: lime `#A2CB10`, red `#A71619`, near-black
  `#0C0D0E`, and warm off-white `#FFFBF7`; add quiet neutral surfaces only to
  support hierarchy. Maintain legible contrast, including dark text on lime
  actions.
- Show the TraderLab Gestão identity with the Bruno Borges brand signature.
  No approved standalone logo asset is present in this repository, so the
  current implementation uses a restrained typographic BB mark and wordmark.
- Panels use soft offset shadows, rounded corners, and clear whitespace. Use
  green sparingly for section markers and primary emphasis; reserve red for
  destructive or error states.
- Preserve actual existing empty, loading, error, and populated states. Never
  invent dashboard metrics or sample records.

## Composition and behavior

- First viewport begins with the persistent sidebar and a quiet account bar.
- Each page leads with its current title and description, then its existing
  filters/actions and main list or form.
- Preserve catalog tables as coherent lists; keep columns aligned at desktop
  widths and retain the current stacked treatment on smaller screens.
- Do not add a dashboard, task, workflow, interaction, status, or capability.

## Signature and reach

A small lime section marker and a disciplined type hierarchy distinguish the
current task. Reuse this language across the existing admin workspace; the
same identity should continue to work on forms and detail pages without
changing their behavior.

## Risks and guardrails

- Too much lime can impair contrast and make the workspace tiring; retain
  near-black text on lime and use the color mostly for emphasis.
- Serif text belongs to headings only; never use it in tables or controls.
- Shadows should define panels, not every row or nested element.
- No new functionality, copy claims, API calls, data, or packages.
