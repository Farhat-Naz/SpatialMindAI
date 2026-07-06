<!--
## Sync Impact Report

**Version Change**: 1.0.0 → 2.0.0 (MAJOR)

**Bump Rationale**: This is a full restructuring for the platform's next phase, not an
additive patch. Two changes are backward-incompatible with v1.0.0: (1) Principle VI
(Accessibility) raises the compliance bar from WCAG 2.1 AA to WCAG 2.2 AA — a
redefinition of an existing gate, not just expanded guidance; (2) a new mandatory API
Architecture principle (V) forbids a pattern (direct third-party API calls from
components) that was previously unconstrained, which can break existing code that
does not yet route through Next.js Route Handlers. Per the versioning policy below,
redefinition of a principle or a technology/architecture mandate change requires a
MAJOR bump.

**Modified Principles**:
- "I. TypeScript Strict Mode" → "II. Strict TypeScript" (renumbered, content preserved)
- "II. Feature-First Modular Architecture" → "I. Feature-Based Architecture" (renumbered,
  narrowed scope — folder structure and naming detail extracted into new Principles
  XII and XIII)
- "III. Component Design Standards" → split into "III. Separation of Concerns"
  (component/hook/service/store boundaries retained) and "XVI. Responsive-First
  Design" (responsive rules extracted, expanded)
- "IV. State Management & Data Fetching" → "IV. State Management Rules" (renumbered,
  Server Actions guidance narrowed in favor of explicit Route Handler mandate)
- "V. GIS & Performance" → "VII. Performance" (renumbered; GIS-specific dynamic-import
  rules generalized to all heavy client-only modules)
- "VI. Accessibility & Responsive Design" → "VI. Accessibility" (WCAG bar raised from
  2.1 AA to 2.2 AA; responsive rules moved to XVI)
- "VII. Independent Testability" → merged into "VIII. Testing Standards" (broadened
  with unit/component/integration test tiers)

**Added Principles**:
- V. API Architecture (Backend-for-Frontend via Route Handlers)
- IX. Security
- X. Documentation Requirements
- XI. Code Review Standards
- XII. Folder Structure Conventions
- XIII. Naming Conventions
- XIV. Error Handling Strategy
- XV. Logging Strategy
- XVI. Responsive-First Design
- XVII. Production Readiness Requirements
- XVIII. AI Integration Guidelines

**Removed Sections**: None (prior "Quality, Testing & Documentation" section content
was redistributed into Principles VIII, IX, X, XI, XVII rather than deleted)

**Added Sections**: None beyond Core Principles (Technology Stack and Governance
sections retained, updated in place)

**Templates Reviewed**:
- `.specify/templates/plan-template.md` ✅ — Constitution Check gate is derived
  dynamically from this file; no hardcoded principle references to update
- `.specify/templates/spec-template.md` ✅ — technology-agnostic; no changes needed
- `.specify/templates/tasks-template.md` ✅ — generic phase/task structure; already
  supports error-handling, logging, and security task categories referenced by new
  principles
- `.specify/templates/commands/` — directory does not exist; skipped
- `README.md` / `docs/quickstart.md` — not present at repo root; skipped

**Deferred TODOs**: None — all placeholders resolved. RATIFICATION_DATE preserved
from v1.0.0 (2026-06-29, the project's original adoption date).
-->

# SpatialMind AI Constitution

## Core Principles

### I. Feature-Based Architecture

Code MUST be organized by feature, not by technical layer. Each feature directory
under `src/features/<name>/` MUST own its `components/`, `hooks/`, `services/`,
`store/`, `types/`, and tests. Cross-feature imports MUST go through the feature's
public barrel (`index.ts`) only — deep-importing another feature's internal files is
forbidden. Shared, feature-agnostic code lives in `src/shared/`. A feature MUST be
deletable by removing its directory and its single barrel import, with no dangling
references elsewhere.

**Rationale**: Feature isolation enables parallel development, independent testing, and
safe removal or replacement of entire capabilities without cascading side effects
across an enterprise GIS codebase with many concurrent workstreams.

### II. Strict TypeScript (NON-NEGOTIABLE)

All code MUST be written in TypeScript in `strict` mode. The `any` type MUST NOT be
used; `unknown` with type narrowing, generics, or discriminated unions MUST be used
instead. `@ts-ignore` and `@ts-expect-error` MUST NOT be used to silence type errors —
a type error MUST be fixed at its source or the underlying type MUST be corrected via
declaration augmentation. The build MUST produce zero TypeScript errors
(`tsc --noEmit`) before merge. Untyped third-party modules MUST be given explicit
`.d.ts` declarations before use.

**Rationale**: Type safety is the primary defense against class-wide runtime bugs in a
geospatial domain where coordinate types, projections, and feature schemas are easily
confused, and where a suppressed type error hides exactly the class of bug strict mode
exists to catch.

### III. Separation of Concerns

UI components, hooks, services, and stores MUST NOT mix responsibilities. Components
MUST only render markup and wire up event handlers — they MUST NOT contain data
fetching, business logic, or direct store mutation logic inline. Reusable behavior
(data fetching, map interaction, coordinate transforms, throttling) MUST live in a
named custom hook under the feature's `hooks/`. Calls to Route Handlers or other
backends MUST be wrapped in a `services/` function, never issued ad hoc from a
component or hook body. Zustand stores MUST expose actions as the only mutation path
— no component may reach into store internals or mutate state directly. React
components MUST NOT exceed 300 lines; exceeding this is a signal to extract a hook or
sub-component.

**Rationale**: A four-way boundary (component / hook / service / store) keeps each
unit independently testable and prevents the "smart component" anti-pattern that makes
GIS UIs with heavy state (map view, layers, async data) unmaintainable.

### IV. State Management Rules

Client/UI state (theme, sidebar state, modal visibility, map viewport, selected tool)
MUST be managed with **Zustand**. Server state (anything fetched from a Route Handler
or external API) MUST be fetched, cached, and synchronized with **TanStack React
Query** — it MUST NOT be copied into a Zustand store as a shadow cache. Query keys
MUST be centralized per feature (`services/queryKeys.ts`) to prevent cache collisions
and enable targeted invalidation. Mutations MUST use React Query's `useMutation` with
explicit `onSuccess` cache invalidation, not manual refetch calls scattered across
components.

**Rationale**: Segregating ephemeral UI state (Zustand) from server-cache state (React
Query) prevents the stale-data and over-fetching bugs that plague data-heavy GIS
dashboards, and centralized query keys prevent silent cache-invalidation bugs as the
feature set grows.

### V. API Architecture (Backend-for-Frontend)

React components and hooks MUST NOT call third-party APIs, external tile services
requiring secrets, or any endpoint requiring an API key directly from the browser.
Every such integration MUST go through a Next.js **Route Handler** (`app/api/**/route.ts`)
acting as a backend-for-frontend (BFF) layer, which holds credentials server-side,
validates/shapes the request, and returns a typed response the client consumes via a
`services/` function and React Query. Public, keyless, CORS-enabled endpoints (e.g.
OSM/Esri tile XYZ requests made directly by Leaflet's `TileLayer`) are the only
exception, since Leaflet must fetch tiles directly for performance and these carry no
secret. Route Handlers MUST validate all inputs (see Principle IX) and MUST NOT
forward raw client input to an upstream API unvalidated.

**Rationale**: Routing third-party and credentialed calls through a BFF layer keeps
API keys out of client bundles, gives one place to enforce rate limiting/validation/
caching, and insulates the frontend from upstream API shape changes — essential before
AI and paid GIS data providers are integrated in future phases.

### VI. Accessibility

Every interactive element MUST be keyboard-navigable with a visible focus indicator.
Color contrast and all other success criteria MUST meet **WCAG 2.2 AA**. All map
controls (zoom, scale, layer switcher, draw tools) MUST carry ARIA labels reflecting
their action, not their icon. Live-updating regions (coordinate readout, async status)
MUST use `aria-live="polite"`. Dark/light theme MUST be implemented via Tailwind's
`dark:` variant driven by a root `class`/`data-theme` attribute — no component may
hardcode a color value outside the design-token CSS variables. `shadcn/ui` (Radix)
primitives MUST be used for interactive controls (buttons, dialogs, menus, tooltips)
in preference to hand-rolled HTML, since they ship correct ARIA and focus-trap behavior.

**Rationale**: Enterprise GIS platforms are used in field, kiosk, and assistive-technology
contexts where accessibility is a contractual requirement. WCAG 2.2 adds target-size and
focus-appearance criteria directly relevant to map control hit-targets.

### VII. Performance

Any module that depends on browser-only globals or exceeds ~50 KB (Leaflet, future
Turf.js/Proj4js additions, chart libraries) MUST be loaded via `next/dynamic` with
`{ ssr: false }` and MUST NOT be part of the initial route bundle. Such modules MUST
be lazy-loaded at the point of use, not eagerly imported at the top of a shared file.
A synchronous computation that can block the main thread for more than 16 ms (spatial
analysis, large GeoJSON parsing) MUST be moved to a Web Worker. `@next/bundle-analyzer`
MUST be run before merging any PR that adds a new dependency over 20 KB gzipped, and
the initial JS payload budget of 200 KB gzipped MUST NOT be exceeded without a
documented Complexity Tracking justification.

**Rationale**: Mapping and spatial-analysis libraries are heavy; eager loading destroys
Time-to-Interactive on the low-bandwidth or field-network conditions enterprise GIS
users often operate under.

### VIII. Testing Standards

Every feature MUST include three tiers of tests: **unit tests** (Vitest) for every
custom hook and pure utility function; **component tests** (Vitest + React Testing
Library) for every component with conditional rendering, user interaction, or ARIA
state; and at least one **integration test** covering the feature's primary user
journey end-to-end within the app shell. Tests MUST be co-located under the feature's
`__tests__/` directory and MUST NOT share mutable global state between test cases —
each test MUST reset stores/mocks in `beforeEach`. A feature MUST NOT be marked
complete while any of its three test tiers is missing.

**Rationale**: In a platform with overlapping map layers, async data, and shared
Zustand stores, the three-tier requirement catches regressions at the level (unit,
render, or flow) where they actually originate, and isolated test state prevents flaky
cross-test pollution.

### IX. Security

Every response MUST carry the security headers already enforced in `next.config.ts`:
a Content-Security-Policy (`default-src 'self'`, explicit allowlists for tile-server
`img-src`/`connect-src`, no wildcard sources), `X-Frame-Options: DENY`,
`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
`Strict-Transport-Security`, and a restrictive `Permissions-Policy`. The CSP MUST NOT
include `'unsafe-eval'` in production; if a development-only relaxation is required
(e.g. Next.js Fast Refresh), it MUST be gated behind `process.env.NODE_ENV !== "production"`
and never ship to a production build. Every Route Handler MUST validate and parse its
input with a schema (e.g. Zod) before use — untyped `request.json()` output MUST NOT
be passed directly to a downstream call or trusted as-is. Secrets MUST be read from
environment variables server-side only and MUST NEVER be embedded in a client
component, a `NEXT_PUBLIC_*` variable, or a Zustand store.

**Rationale**: A CSP that silently breaks dev builds gets "fixed" by over-relaxing it
in ways that leak into production; explicit dev/prod gating and mandatory input
validation at the BFF boundary close both the accidental-regression and injection
attack surfaces.

### X. Documentation Requirements

Every feature directory MUST include a `README.md` documenting: purpose, its public
API (components/hooks exported via `index.ts`), a usage example, and known
limitations. Every exported hook, service function, and store action MUST carry a
single-line JSDoc summary stating what it does and any non-obvious constraint (units,
coordinate reference system, side effects). Geospatial code MUST document its
coordinate reference system and units at the point of definition, not merely in a
top-level doc. Route Handlers MUST document their request/response shape (JSDoc or a
co-located `.types.ts`) since they form the contract the frontend depends on.

**Rationale**: Undocumented coordinate/unit assumptions are the single most common
source of silent GIS bugs (e.g. lat/lng swapped, meters vs. degrees); documenting them
at the definition site keeps the assumption visible where it can break.

### XI. Code Review Standards

Every PR MUST include a completed "Constitution Check" confirming no principle in this
document is violated, or a Complexity Tracking entry justifying the exception. Every
PR MUST pass all Quality Gates (Principle XVII) before requesting review. At least one
peer review is REQUIRED before merge; changes to this constitution or to a feature's
public barrel (`index.ts`) contract REQUIRE two reviews. Reviewers MUST verify: type
safety (no new `any`/`@ts-ignore`), test coverage for new logic, accessibility of new
interactive elements, and that no third-party API call was added outside a Route
Handler.

**Rationale**: A written review checklist tied directly to the constitution turns
these principles from aspirational text into an enforced gate, rather than guidance
reviewers must remember unaided.

### XII. Folder Structure Conventions

The repository MUST follow this shape: `src/app/` for Next.js App Router routes and
layouts only (no business logic); `src/features/<feature>/{components,hooks,store,
services,types,__tests__}/` per feature; `src/shared/{components,hooks,lib,types}/`
for cross-feature primitives; `app/api/<domain>/route.ts` for Route Handlers, grouped
by the domain they serve, mirroring the feature that consumes them. No file MUST be
placed at `src/` root other than the four App Router special files. New top-level
directories under `src/` other than `app/`, `features/`, and `shared/` MUST NOT be
created without amending this section.

**Rationale**: A single, predictable shape means any engineer (or AI coding agent) can
locate or place code without a per-feature judgment call, and prevents the slow drift
toward a layer-based structure that Principle I forbids.

### XIII. Naming Conventions

Components MUST be named in `PascalCase` matching their filename
(`MapContainer.tsx` exports `MapContainer`). Hooks MUST be named `useX` in `camelCase`
and live in a file of the same name. Zustand stores MUST be named `useXStore` and
their file `xStore.ts`. Route Handlers MUST live at `route.ts` under a noun-pluralized,
kebab-case directory reflecting the resource (`app/api/map-layers/route.ts`). Types and
interfaces MUST be `PascalCase` with no `I`-prefix (`MapStatus`, not `IMapStatus`).
Boolean variables and props MUST be prefixed `is`/`has`/`should` (`isLoading`, not
`loading`). Constants MUST be `SCREAMING_SNAKE_CASE` only at module scope for true
constants (config values, enums-as-objects) — not for ordinary `const` bindings.

**Rationale**: Consistent naming lets contributors predict a symbol's role (component
vs. hook vs. store vs. type) from its name alone, which matters more as the number of
features — and the number of AI-assisted contributors — grows.

### XIV. Error Handling Strategy

Every async boundary (Route Handler, React Query fetcher, Leaflet event handler) MUST
catch and classify its own errors — errors MUST NOT propagate as an unhandled
rejection to the console alone. Route Handlers MUST return a typed error shape
(`{ error: { code, message } }`) with an appropriate HTTP status, never a bare 500
with a stack trace leaked to the client. Every feature that can fail visibly to the
user (map load, tile fetch, data query) MUST render an explicit error state
(overlay, inline message, or toast) with a user-facing recovery action (Retry) where
one exists — a silent blank screen on failure is a defect. React error boundaries
MUST wrap each top-level feature mounted in the dashboard shell so one feature's crash
cannot blank the entire app.

**Rationale**: A blank screen with no console error (as previously seen when the CSP
silently broke hydration) is the hardest class of bug to diagnose; mandatory
classification and a visible error state make failures observable by construction
instead of by accident.

### XV. Logging Strategy

Client-side, only actionable warnings/errors MUST be logged via a shared
`shared/lib/logger.ts` wrapper (not raw `console.*` calls scattered through
features), so log verbosity and destinations (e.g. an error-reporting service) can be
changed in one place. Route Handlers MUST log every request's method, path, status
code, and duration in a structured (JSON) format suitable for ingestion by a log
aggregator. Logs MUST NOT include secrets, full request bodies containing user PII, or
API keys. Debug-only `console.log` calls MUST NOT be committed — use the logger's
`debug` level, which MUST be a no-op in production builds.

**Rationale**: Scattered `console.log` calls are unsearchable and often leak
sensitive data; a single logger module gives one lever to raise verbosity locally
without shipping noise (or secrets) to production.

### XVI. Responsive-First Design

Layouts MUST be authored mobile-first using Tailwind's default (unprefixed) breakpoint
for the smallest viewport, with `md:`/`lg:` overrides layering up. Every screen MUST
remain fully functional (no horizontal scroll, no clipped controls) at 320 px width.
Breakpoint-dependent behavior in JavaScript (not just CSS) MUST use a shared
`useBreakpoint`/`useMediaQuery` hook rather than ad hoc `window.innerWidth` checks, so
the SSR/CSR breakpoint mismatch is handled in exactly one place. Touch targets MUST be
at least 44×44 px on touch-capable viewports.

**Rationale**: Field GIS usage spans phones, rugged tablets, and desktop monitors;
mobile-first authoring plus a single breakpoint hook prevents the layout drift and
hydration-mismatch bugs that emerge when each feature reimplements its own responsive
logic.

### XVII. Production Readiness Requirements

Before a feature is considered done, all of the following Quality Gates MUST pass:
zero TypeScript errors (`tsc --noEmit`); zero ESLint errors or warnings
(`eslint src --max-warnings 0`); all three testing tiers from Principle VIII passing;
a Lighthouse Accessibility score ≥ 90 on any new route; bundle-analyzer output
reviewed per Principle VII; and all security headers from Principle IX verified
present on the deployed response. A feature MUST NOT be merged with a `TODO` marking
unfinished error handling or a stubbed-out API call left in place of a Route Handler.
Environment-specific configuration MUST be read via `vercel env` / `.env.local` and
MUST NOT be hardcoded.

**Rationale**: A single enumerated gate list, checked mechanically, is what turns
"production-ready" from a subjective judgment call into a verifiable checklist before
every merge.

### XVIII. AI Integration Guidelines (Future Features)

Any future AI-powered feature (chat assistant, spatial-query natural-language
interface, AI-generated layer suggestions) MUST treat the LLM provider as a
third-party API under Principle V — all model calls MUST be issued from a Route
Handler, never from the client, so provider keys stay server-side and usage can be
rate-limited and logged per Principle XV. Streaming responses MUST use the Vercel AI
SDK's streaming primitives rather than a hand-rolled SSE/WebSocket implementation.
AI-generated content that results in a state mutation (e.g., "AI suggests adding this
layer") MUST require an explicit user confirmation step before the mutation is
applied — no AI output may silently change map state, stored data, or user
preferences. Prompts and system instructions MUST be version-controlled alongside the
feature's code, not stored only in a provider dashboard.

**Rationale**: Establishing the BFF-only, confirm-before-mutate, and versioned-prompt
rules now — before any AI feature exists — prevents the two failure modes most common
in AI-added-later codebases: leaked provider keys and AI actions that silently
overwrite user or spatial state.

## Technology Stack

The following technologies are **mandatory** for all features. Alternatives require a
written rationale and governance approval (see Amendment procedure below).

| Concern | Mandated Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI Library | React 19 |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (Radix UI primitives) |
| Mapping | React Leaflet (Leaflet, dynamic import, SSR disabled) |
| Global/UI State | Zustand v5+ |
| Server State / Caching | TanStack React Query v5+ |
| Backend-for-Frontend | Next.js Route Handlers (`app/api/**/route.ts`) |
| Unit / Component Testing | Vitest + React Testing Library |
| Linting | ESLint (`next/core-web-vitals` + `typescript-eslint`), zero warnings |

Spatial-analysis (Turf.js) and projection (Proj4js) libraries are pre-approved for
future features under Principle VII (dynamic import, `ssr: false`) but MUST NOT be
added to the dependency tree until a feature actually requires them. No additional
state management libraries, CSS frameworks, or mapping libraries may be introduced
without amending this constitution.

## Governance

This constitution supersedes all other development guidelines. Where conflict exists
between this document and any other convention, this document prevails.

**Amendment procedure**:
1. Author opens a PR with changes to this file and a completed Sync Impact Report.
2. At least one peer review is required; changes to Core Principles require two.
3. Dependent templates (plan, spec, tasks) MUST be reviewed for consistency in the
   same PR; update them if a principle change affects their content.
4. Bump the version per the semantic versioning rules below.

**Compliance**: All PRs MUST include a "Constitution Check" confirming no principle is
violated (Principle XI). Complexity exceptions MUST be documented in the plan's
Complexity Tracking table with a justification.

**Versioning policy**:
- PATCH — wording clarifications, typo fixes, non-semantic refinements.
- MINOR — new principle or section added, or existing guidance materially expanded,
  with no existing principle redefined or weakened.
- MAJOR — a principle removed, redefined (e.g. a compliance bar raised or lowered), or
  a technology/architecture mandate changed in a way that can require existing code to
  change.

**Version**: 2.0.0 | **Ratified**: 2026-06-29 | **Last Amended**: 2026-07-06
