<!--
## Sync Impact Report

**Version Change**: N/A (initial ratification) → 1.0.0

**Modified Principles**: None (initial creation — all principles are new)

**Added Sections**:
- Core Principles (I–VII)
- Technology Stack
- Quality, Testing & Documentation
- Governance

**Removed Sections**: None

**Templates Reviewed**:
- `.specify/templates/plan-template.md` ✅ — Constitution Check section aligns with principles
- `.specify/templates/spec-template.md` ✅ — Independent-testability requirement matches Principle VII
- `.specify/templates/tasks-template.md` ✅ — Test-first and doc tasks align with Principles V–VII
- `.specify/templates/commands/` — No commands directory found; skipped

**Deferred TODOs**: None — all placeholders resolved
-->

# SpatialMind AI Constitution

## Core Principles

### I. TypeScript Strict Mode (NON-NEGOTIABLE)

All code MUST be written in TypeScript. The `any` type is strictly forbidden — use
`unknown`, generics, or narrowed union types instead. The build MUST produce zero
TypeScript errors and zero ESLint warnings before any PR is merged. Implicit `any`
from third-party libraries MUST be typed via declaration augmentation or wrapper types.

**Rationale**: Type safety is the primary defence against class-wide runtime bugs in
a complex geospatial domain where coordinate types, projection objects, and GIS feature
schemas are easily confused.

### II. Feature-First Modular Architecture

Code MUST be organized by feature, not by layer. Each feature folder owns its
components, hooks, services, stores, types, and tests. Cross-feature imports MUST
go through a public barrel (`index.ts`) only — never deep-import another feature's
internals. SOLID principles (Single Responsibility, Open/Closed, Liskov Substitution,
Interface Segregation, Dependency Inversion) MUST be applied at the module level.
Code duplication is forbidden — extract shared logic into `/lib` or `/hooks` before
a second copy appears.

**Rationale**: Feature isolation allows parallel development, independent testing,
and safe deletion/replacement of entire capabilities without cascading side-effects.

### III. Component Design Standards

React components MUST NOT exceed 300 lines. UI rendering and business logic MUST be
separated: components render; hooks and services compute. Every reusable behaviour
(data fetching, map interaction, coordinate transformation, event binding) MUST live
in a named custom hook. Props interfaces MUST be explicitly typed — no inline object
literals as prop types. Default exports are reserved for page-level components;
all others MUST use named exports.

**Rationale**: Small, focused components are the only practical way to maintain
readability, testability, and reusability across a GIS platform where UI complexity
compounds rapidly.

### IV. State Management & Data Fetching

Global application state MUST be managed with **Zustand**. Async server data MUST be
fetched, cached, and synchronized with **React Query** (TanStack Query). Server
Actions MUST be used only when mutation requires server-side authority (auth, DB
writes); they MUST NOT replace client-side state derivation. Client-side state MUST
NOT duplicate server cache — derive from React Query where possible.

**Rationale**: Segregating ephemeral UI state (Zustand) from server-cache state
(React Query) prevents the stale-data and over-fetching bugs that plague GIS
dashboards with heavy network payloads.

### V. GIS & Performance

Heavy GIS modules (Leaflet, Turf.js, Proj4js) MUST be loaded via `dynamic()`
(Next.js dynamic imports) with `{ ssr: false }` where browser APIs are required.
Map components MUST be lazy-loaded at the route boundary. Geospatial computations
that block the main thread for more than 16 ms MUST be moved to a Web Worker.
Bundle analysis MUST be run before any PR that adds a new GIS dependency. Tile
layers and vector data MUST be paginated or tiled — no full-dataset renders.

**Rationale**: Leaflet, Turf, and Proj4 together exceed 500 KB uncompressed. Eager
loading destroys Time-to-Interactive on low-bandwidth enterprise networks.

### VI. Accessibility & Responsive Design

Every interactive element MUST be keyboard-navigable with visible focus indicators.
Color contrast MUST meet WCAG 2.1 AA. All map controls MUST have ARIA labels. The
UI MUST be fully functional at 320 px width and on touch devices. Dark mode MUST be
implemented via Tailwind's `dark:` variant and a `data-theme` root attribute — no
hardcoded color values. shadcn/ui primitives MUST be preferred over custom HTML
elements for all interactive controls.

**Rationale**: Enterprise GIS platforms are used in diverse environments (field
tablets, high-contrast monitors, screen readers). Accessibility is a contractual
requirement, not a nice-to-have.

### VII. Independent Testability

Every feature MUST be independently testable in isolation. A feature MUST deliver
observable value (render correctly, handle its primary user action) without requiring
any other feature to be implemented. Integration tests MUST cover the critical GIS
path (layer load → spatial query → result render). Unit tests MUST cover all custom
hooks and utility functions. Tests MUST NOT share mutable global state across test
cases.

**Rationale**: In a platform with overlapping map layers, projections, and async
data sources, flaky inter-feature dependencies are the primary source of regression.

## Technology Stack

The following technologies are **mandatory** for all features. Alternatives require a
written rationale and governance approval.

| Concern | Mandated Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Mapping | Leaflet (dynamic import, SSR disabled) |
| Spatial Analysis | Turf.js (dynamic import) |
| Projections | Proj4js (dynamic import) |
| Async / Cache | React Query (TanStack Query v5+) |
| Global State | Zustand v4+ |
| Linting | ESLint (next/core-web-vitals + typescript-eslint) |

No additional state management libraries, CSS frameworks, or mapping libraries may
be introduced without amending this constitution.

## Quality, Testing & Documentation

**Quality Gates** — all MUST pass before merge:
- Zero TypeScript errors (`tsc --noEmit`)
- Zero ESLint warnings or errors
- Lighthouse Accessibility score ≥ 90 on key routes
- No new `any` types (enforced via `@typescript-eslint/no-explicit-any: error`)

**Testing Requirements**:
- Every feature MUST include at minimum: one integration test covering its primary
  user journey, and unit tests for all custom hooks and pure utility functions.
- Tests MUST be co-located under the feature folder in a `__tests__/` subdirectory.
- Test files MUST NOT import implementation details from sibling features.

**Documentation Requirements**:
- Every feature MUST include a `README.md` inside its feature folder documenting:
  purpose, public API (hooks/components exported), usage example, and known
  limitations.
- Public hooks and service functions MUST have a single-line JSDoc summary.
- Complex geospatial algorithms MUST document coordinate reference system
  assumptions and units.

## Governance

This constitution supersedes all other development guidelines. Where conflict exists
between this document and any other convention, this document prevails.

**Amendment procedure**:
1. Author opens a PR with changes to this file and a completed Sync Impact Report.
2. At least one peer review is required; changes to Core Principles require two.
3. Dependent templates (plan, spec, tasks) MUST be updated in the same PR.
4. Bump the version per semantic versioning rules defined in the header comment.

**Compliance**: All PRs MUST include a "Constitution Check" confirming no principle
is violated. Complexity exceptions MUST be documented in the plan's Complexity
Tracking table with a justification.

**Versioning policy**:
- PATCH — wording clarifications, typo fixes, non-semantic refinements.
- MINOR — new principle or section added, or existing guidance materially expanded.
- MAJOR — principle removed, redefined, or technology mandate changed.

**Version**: 1.0.0 | **Ratified**: 2026-06-29 | **Last Amended**: 2026-06-29
