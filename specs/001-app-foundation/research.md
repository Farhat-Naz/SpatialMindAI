# Research: Platform Foundation & Map Shell

**Feature**: 001-app-foundation
**Date**: 2026-06-29

All decisions below are derived from the project constitution (`.specify/memory/constitution.md`)
and the clarified feature spec. No external research required — the tech stack is fully mandated.

---

## Decision 1: Framework & Language

**Decision**: Next.js 15 App Router + TypeScript 5 (strict mode)

**Rationale**: Constitution mandates this. App Router provides React Server Components,
streaming, and the file-system routing that future GIS features (spatial analysis pages,
AI assistant route) will use. TypeScript strict mode prevents coordinate-type bugs.

**Alternatives considered**: Pages Router (rejected — App Router is the mandated standard
and enables future RSC-based features); JavaScript (rejected — forbidden by constitution).

---

## Decision 2: Styling System

**Decision**: Tailwind CSS v4 + shadcn/ui (Radix UI primitives)

**Rationale**: Constitution mandates Tailwind + shadcn/ui. The `dark:` variant class
strategy is the only compliant way to implement dark mode — it requires `darkMode: 'class'`
in Tailwind config and toggling the `dark` class on the `<html>` element.

**Key constraint**: shadcn/ui uses CSS custom properties (variables) for its color tokens.
All dark-mode overrides come through `.dark { --background: ...; }` in `globals.css`.
Never use hardcoded hex/rgb values in components — always use Tailwind semantic tokens.

**Alternatives considered**: CSS Modules (rejected — Tailwind is constitutionally mandated);
MUI / Chakra (rejected — shadcn/ui is the mandated component library).

---

## Decision 3: Leaflet Integration Pattern

**Decision**: `next/dynamic` with `{ ssr: false }` wrapping the entire map component tree

**Rationale**: Leaflet accesses `window`, `document`, and `navigator` directly during
module initialization — not just during render. This means even wrapping in `useEffect`
is insufficient if the module is imported at the top of a file that SSR processes.
The only safe pattern is a dynamic import at the route/component boundary.

**Pattern**:
```
MapContainer (server-safe wrapper, exported from features/map/index.ts)
  └── dynamic(() => import('./MapCore'), { ssr: false })
       └── MapCore (Leaflet lives here; only runs in browser)
```

**Alternatives considered**: `useEffect` + `typeof window` check (rejected — Leaflet's
side-effects at import time still run in SSR without `ssr: false`); Mapbox GL JS
(rejected — constitutionally mandated to use Leaflet).

---

## Decision 4: State Management Architecture

**Decision**: Zustand slices per feature + React Query (set up but idle in Phase 1)

**Rationale**: Constitution mandates Zustand for global state and React Query for async.
Phase 1 has no server data, but QueryProvider MUST be wired up now so future features
compose cleanly without re-architecting providers.

**Three Zustand slices**:
- `themeStore` — active theme, persisted to localStorage
- `dashboardStore` — sidebarState (expanded | collapsed), previousDesktopSidebarState
- `mapStore` — center (LatLng), zoom (number), activeBasemap (BasemapId), mapStatus
  (idle | loading | ready | error), lastKnownCoords (LatLng | null)

**Persistence**: Use Zustand `persist` middleware with `localStorage` storage for
`themeStore` (theme preference) and `dashboardStore` (desktopSidebarState only — not
mobile state which always resets).

**Alternatives considered**: React Context (rejected — constitutionally prohibited for
global state); Redux Toolkit (rejected — Zustand is mandated and avoids boilerplate).

---

## Decision 5: Responsive Sidebar Strategy

**Decision**: CSS transition-based collapse + `useBreakpoint` hook for programmatic
auto-collapse/restore

**Rationale**: Sidebar transition MUST complete within 300 ms (SC-003). CSS transitions
on `width` + `overflow: hidden` achieve this without JS animation libraries.
A `useBreakpoint(768)` hook using `window.matchMedia` detects the md breakpoint and
triggers Zustand store updates (auto-collapse / desktop-state restore).

**Mobile overlay**: On mobile, the sidebar is NOT a narrow strip — it is a full overlay
(shadcn/ui `Sheet`) that overlays the map. The CSS collapse is desktop-only behavior.

---

## Decision 6: Map Coordinate Throttling

**Decision**: Throttle Leaflet `mousemove` handler to 16 ms (one animation frame)

**Rationale**: Leaflet fires `mousemove` on every pointer pixel — unthrottled, this
triggers a Zustand store update at 60+ Hz. A 16 ms throttle (matching 60 fps) is
imperceptible to users and prevents unnecessary React re-renders in the StatusBar.

**Implementation**: Custom `useCoordinates` hook encapsulates the Leaflet map ref,
registers the throttled event listener, and returns `{ coords, isReady }`.

---

## Decision 7: Map Error & Loading Overlay Strategy

**Decision**: Internal overlay components rendered inside `MapContainer` (not portals),
driven by `mapStore.mapStatus`

**Rationale**: Map overlays (loading spinner, error message + Retry button) are visually
contained within the map viewport. Rendering them inside the MapContainer div keeps
z-indexing simple and avoids portal DOM management. The `mapStatus` field in `mapStore`
acts as a finite state machine: `idle → loading → ready` or `idle → loading → error`.
The Retry action transitions `error → loading` and re-initialises the tile layer.

---

## Decision 8: Testing Stack

**Decision**: Vitest + React Testing Library (unit/integration) + Playwright (E2E)

**Rationale**: Vitest is the modern replacement for Jest in Next.js 15 projects (better
ESM support, faster). React Testing Library enforces behaviour-over-implementation
testing. Playwright provides real-browser E2E tests matching the acceptance scenarios
(resize to 375 px, etc.) that jsdom cannot replicate.

**Alternatives considered**: Jest (works, but ESM config in Next.js 15 is painful);
Cypress (heavier than Playwright, slower CI).

---

## Decision 9: Security Headers Delivery

**Decision**: Next.js `next.config.ts` `headers()` function for local development +
deployment platform headers for production

**Rationale**: `next.config.ts` supports a `headers()` async function that injects HTTP
response headers at the Next.js server level. This covers dev and self-hosted production.
For platforms like Vercel/Netlify, headers can be additionally enforced via their
platform config (`vercel.json` / `_headers`). CSP must explicitly allow:
- `img-src`: tile.openstreetmap.org, *.tile.openstreetmap.org (OSM), tile CDN for satellite
- `connect-src`: same tile origins (for fetch-based tile loaders)
- `script-src`: 'self' (no inline scripts; Next.js bundles are from 'self')

**Alternatives considered**: Middleware.ts (adds latency to every request; headers() is
sufficient and zero-overhead for static assets).

---

## Decision 10: Basemap Configuration

**Decision**: Two basemaps — OpenStreetMap (street) and Esri World Imagery (satellite)

**Rationale**: OSM is the default, free, and attribution-clear. Esri World Imagery is
the most widely available free satellite tile service. Both are usable without API keys
in Phase 1. Basemap configs (name, URL template, attribution) are stored in
`features/map/constants/basemaps.ts` as a typed array — never hardcoded in components.

**Alternatives considered**: Mapbox Satellite (requires API key — out of scope Phase 1);
Stamen (retired); CARTO (free tier suitable but OSM+Esri are more recognisable).
