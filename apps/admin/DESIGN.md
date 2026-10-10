---
name: TraderLab Gestão
description: A practical, role-aware workspace for managing TraderLab.
colors:
  primary: "#A2CB10"
  primary-hover: "#8BAE0B"
  primary-ink: "#354604"
  danger: "#A71619"
  ink: "#0C0D0E"
  muted: "#6E6D6B"
  canvas: "#F5F3EF"
  surface: "#FFFBF7"
  line: "#E5E1DC"
  soft-green: "#EFF6D9"
typography:
  display:
    fontFamily: "Roboto Serif, Georgia, serif"
    fontSize: "clamp(31px, 3.5vw, 44px)"
    fontWeight: 700
    lineHeight: 1.15
  title:
    fontFamily: "Roboto Serif, Georgia, serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Roboto, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Roboto, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  xs: "4px"
  sm: "6px"
  md: "9px"
  nav: "11px"
  card: "14px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "18px"
  xl: "24px"
  section: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    height: "40px"
    padding: "9px 12px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "27px 30px"
  navigation-active:
    backgroundColor: "{colors.soft-green}"
    textColor: "{colors.ink}"
    rounded: "{rounded.nav}"
    height: "46px"
    padding: "10px 14px"
---

# Design System: TraderLab Gestão

## Overview

**Creative North Star: "Guia prático do TraderLab"**

TraderLab Gestão is a quiet, task-focused management workspace. Its visual language pairs editorial serif headings with compact, highly legible sans-serif controls and data. A persistent left navigation gives mentors and administrators a stable map while each page starts with a short lime marker and its existing title, description, actions, and content.

The system uses warm neutral surfaces, restrained brand color, rounded panels, and soft shadows to make hierarchy easy to scan. The sidebar uses the supplied green Trader Bruno Borges logo for a light background. Catalog rows and notification cards open their detail view when clicked across the row; dedicated edit and secondary action controls remain independently available. This record is derived from shipped CSS and component patterns.

**Key Characteristics:**
- Persistent, role-filtered left navigation
- Roboto Serif headings with Roboto interface text
- Warm canvas, off-white panels, and restrained lime emphasis
- Rounded surfaces with soft structural shadows

## Colors

The palette balances the official lime and red with warm paper neutrals; lime marks active navigation and primary emphasis, while red is reserved for error and destructive states.

### Primary
- **TraderLab Lime** (`{colors.primary}`): Section marker, active emphasis, and primary actions; pair with dark text for readable contrast.
- **Deep Lime** (`{colors.primary-hover}`): Hover treatment for primary actions.
- **Lime Ink** (`{colors.primary-ink}`): Legible text and icon color on pale green surfaces.

### Secondary
- **TraderLab Red** (`{colors.danger}`): Error and destructive feedback.

### Neutral
- **Near Black** (`{colors.ink}`): Main text and dark brand-mark surface.
- **Muted Gray** (`{colors.muted}`): Supporting copy and inactive navigation.
- **Warm Canvas** (`{colors.canvas}`): Workspace background.
- **Warm Off-White** (`{colors.surface}`): Sidebar, header, and cards.
- **Quiet Divider** (`{colors.line}`): Structural borders and separators.
- **Pale Lime** (`{colors.soft-green}`): Selected navigation background.

### Named Rules
**The Restrained Lime Rule.** Keep lime as a focused marker or action emphasis; maintain near-black text on lime.

## Typography

**Display Font:** Roboto Serif (with Georgia, serif fallback)
**Body Font:** Roboto (with ui-sans-serif and system sans-serif fallbacks)

**Character:** The serif gives page and section headings a composed editorial voice. Roboto keeps navigation, tables, controls, and account details practical and compact.

### Hierarchy
- **Display** (700, `clamp(31px, 3.5vw, 44px)`, 1.15): Primary page heading.
- **Title** (700, 18px, 1.3): Notice and section headings.
- **Body** (400, 13px, 1.6): Interface copy and explanatory text; long notice copy is constrained to about 66ch.
- **Label** (600, 11px, 1.4): Compact metadata and status labels.

### Named Rules
**The Heading Contrast Rule.** Use Roboto Serif for headings only; keep tables, controls, and body copy in Roboto.

## Layout

Desktop uses a full-height two-column shell: a persistent 252px sidebar and a fluid content area capped at 1500px. The header stays at the top of the main area, and content uses responsive horizontal padding (`clamp(24px, 3.4vw, 56px)`) with 42px top spacing. Catalogs preserve aligned tables on wider screens and adapt their content on narrow screens. At 740px and below, the sidebar becomes a top section with horizontally scrollable navigation; the content padding reduces to 18px and top spacing to 30px. The recurring token rhythm uses 4, 8, 12, 18, 24, and 32px spacing; page-section spacing is 24px.

## Elevation & Depth

Depth is hybrid: fine neutral borders establish structure, while shadows lift major panels and floating dialogs. Rows and nested content remain comparatively quiet.

### Shadow Vocabulary
- **Card** (`0 12px 30px rgb(37 31 22 / 7%)`): Primary tables and notice panels.
- **Floating** (`0 20px 52px rgb(37 31 22 / 14%)`): Elevated transient surfaces.

### Named Rules
**The Panel-Only Shadow Rule.** Use shadows to define major panels, not every row or nested element.

## Shapes

Cards use gently rounded 14px corners, controls 9px, navigation 11px, and compact nested structures use 4–8px radii. Borders are thin and warm-gray; chips use pill-like 99px corners. The brand mark and account avatar use rounded compact silhouettes.

## Components

### Buttons
- **Shape:** Compact rounded rectangle (6px); account controls are 9px.
- **Primary:** Lime background with near-black text; common account control sizing is 40px high with 9px 12px padding.
- **Hover / Focus:** Shift to deep lime or a quiet green-tinted surface; keyboard focus uses a 3px lime outline with 3px offset.
- **Secondary:** Off-white with a quiet divider border and near-black text.

### Chips
- **Style:** Compact status label, commonly pale green with deep green text or a quiet neutral surface.
- **Shape:** Pill silhouette for status and category tags.

### Cards / Containers
- **Corner Style:** 14px for primary cards.
- **Background:** Warm off-white over a warm canvas.
- **Shadow Strategy:** Soft card shadow with divider borders where layout needs structure.
- **Internal Padding:** Panels use context-specific padding; notification cards use 15px 18px on desktop and 14px 15px on mobile, while detail cards commonly use 20px.

### Inputs / Fields
- **Style:** Follow the off-white surface, quiet border, and compact rounded-control language.
- **Focus:** Clear 3px lime outline with 3px offset.
- **Error:** Use brand red for error text and feedback.

### Navigation
- **Style:** Persistent left rail with 46px minimum-height items, 12px icon gap, and 14px horizontal padding. Inactive items are muted; hover uses canvas neutral; active items use pale lime with dark text and deep-lime icons.
- **Mobile:** Horizontal scroll row at 740px and below.

### Section Marker
A short, 38px-wide lime bar precedes workspace content, linking pages with a consistent marker without adding copy or functionality.

## Do's and Don'ts

### Do:
- **Do** preserve the left navigation as the persistent workspace map.
- **Do** use the established brand fonts and palette roles.
- **Do** maintain readable near-black text on lime actions and markers.
- **Do** reserve shadows for major panels and floating surfaces.
- **Do** preserve existing route content and role-based visibility when extending the UI.
- **Do** make catalog rows and notification cards open their detail route while keeping edit and row-level actions operable.

### Don't:
- **Don't** use serif type in tables, controls, or body text.
- **Don't** spread lime across large areas or use white text on lime actions.
- **Don't** add shadows to every row or nested element.
- **Don't** infer visual rules from an unavailable authenticated screenshot; verify future updates against the rendered workspace.
