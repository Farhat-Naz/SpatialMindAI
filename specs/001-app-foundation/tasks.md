---
description: "Task list for Platform Foundation & Map Shell (Phase 1)"
---

# Tasks: Platform Foundation & Map Shell

**Input**: Design documents from `specs/001-app-foundation/`

**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/ ✅ · quickstart.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Include exact file paths in all descriptions

---

## Phase 1: Setup

**Purpose**: Initialize the project with all required tooling. T001 must complete first; T002–T008 can run in parallel after T001.

- [x] T001 Scaffold Next.js 15 project with App Router and TypeScript in project root
- [x] T002 Configure TypeScript strict mode and `@/` path alias in `tsconfig.json`
- [x] T003 [P] Install all production dependencies: `react-leaflet leaflet @types/leaflet zustand next-themes @tanstack/react-query lucide-react clsx tailwind-merge`
- [x] T004 [P] Configure Tailwind CSS v4 with `darkMode: 'class'` in `tailwind.config.ts` and directives in `src/app/globals.css`
- [x] T005 [P] Initialize shadcn/ui CLI (`npx shadcn@latest init`); configure `components.json` to output to `src/shared/components/ui/`
- [x] T006 [P] Install shadcn/ui components via CLI: `button sheet dropdown-menu tooltip badge separator`
- [x] T007 [P] Configure ESLint with `@typescript-eslint/no-explicit-any: error` and `next/core-web-vitals` preset
- [x] T008 Configure `next.config.ts` with HTTP security headers: CSP (allow OSM + Esri tile CDNs), X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, HSTS

---

## Phase 2: Foundational

**Purpose**: Shared infrastructure that MUST be complete before any user story begins.

⚠️ **CRITICAL**: No user story work starts until this phase is complete.

- [x] T009 Create `src/shared/types/common.types.ts` — export `LatLng`, `Nullable<T>`, `Theme`, `SidebarState`, `MapStatus`
- [x] T010 [P] Extend `src/shared/lib/utils.ts` with `formatLatLng(coords: LatLng | null): string` and `clamp(v, min, max)` alongside existing `cn()`
- [x] T011 [P] Create `src/shared/components/LoadingSpinner.tsx` — accepts `size?: 'sm'|'md'|'lg'`, `label?: string`, `className?`; uses `animate-spin`; `role="status"`
- [x] T012 [P] Create `src/shared/components/ErrorBoundary.tsx` — class component; accepts `fallback: React.ReactNode`; catches render errors
- [x] T013 Configure `src/app/globals.css` — add `@import 'leaflet/dist/leaflet.css'`; define `:root` and `.dark` CSS variable blocks for shadcn tokens; no raw hex values in components
- [x] T014 Create `src/app/providers.tsx` — `'use client'`; `QueryClient` with `staleTime: 5 * 60 * 1000`; export `QueryProvider` wrapping `QueryClientProvider`
- [x] T015 Update `src/app/layout.tsx` — wrap with `next-themes ThemeProvider` (`attribute="class"`, `defaultTheme="system"`, `enableSystem`); wrap with `QueryProvider`; add `suppressHydrationWarning` to `<html>`; use `next/font` for Inter/Geist
- [x] T016 Create feature folder scaffolding per plan.md folder structure — create all dirs and barrel files; populate `src/features/map/constants/basemaps.ts` with `BasemapConfig` type and two entries: `osm-street` (OSM tiles, maxZoom 19) and `esri-satellite` (ArcGIS World Imagery, maxZoom 18)

**Checkpoint**: Foundation ready — user story implementation can begin.

---

## Phase 3: User Story 1 — Full Dashboard Renders on Load (Priority: P1) 🎯 MVP

**Goal**: Complete four-region dashboard (Navbar / Sidebar / Map Viewport / StatusBar) with functional Leaflet map, OSM basemap, zoom/scale controls, live cursor coordinates, layer switcher, and map loading/error states.

**Independent Test**: Open `http://localhost:3000` at 1280×800 — all four regions visible, map loads with OSM tiles, moving cursor over map updates coordinates in status bar, layer switcher shows two options.

### Implementation for User Story 1

- [x] T017 [P] [US1] Create `src/features/map/store/mapStore.ts` — Zustand store; state: `center: LatLng`, `zoom: number`, `activeBasemapId: string`, `mapStatus: MapStatus`, `lastKnownCoords: LatLng | null`, `errorMessage: string | null`; actions: `setCenter`, `setZoom`, `setActiveBasemap`, `setMapStatus`, `setLastKnownCoords`, `setError`, `retry`; defaults: center `{lat:20,lng:0}`, zoom `2`, activeBasemapId `'osm-street'`, mapStatus `'idle'`
- [x] T018 [P] [US1] Create `src/features/dashboard/store/dashboardStore.ts` — Zustand store with persist middleware; persisted: `desktopSidebarPreference: SidebarState` → localStorage key `spatialMind:sidebar`; NOT persisted: `sidebarState: SidebarState` (resets to `'expanded'`); actions: `toggleSidebar`, `autoCollapseForMobile`, `restoreDesktopState`
- [x] T019 [P] [US1] Populate `src/features/map/constants/basemaps.ts` — export `BASEMAPS: readonly BasemapConfig[]` with OSM (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`) and Esri satellite (`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`) entries with correct attributions
- [x] T020 [US1] Create `src/features/map/hooks/useMapStatus.ts` — reads `mapStore`; returns `{ mapStatus, isLoading, isReady, isError, errorMessage, retry }`; `isLoading/isReady/isError` are derived booleans; `retry()` calls `mapStore.retry()`
- [x] T021 [US1] Create `src/features/map/hooks/useCoordinates.ts` — uses `useMapEvents` from react-leaflet; throttles `mousemove` to 16 ms; calls `mapStore.setLastKnownCoords()`; returns `{ coords, formattedLat, formattedLng, isReady }`; shows `"—"` when `mapStatus !== 'ready'`; retains last coords when cursor leaves map
- [x] T022 [P] [US1] Create `src/features/map/components/MapLoadingOverlay.tsx` — accepts `visible: boolean`; `absolute inset-0` positioned; renders centered `<LoadingSpinner />`; `role="status"` `aria-label="Map loading"`; returns null when not visible
- [x] T023 [P] [US1] Create `src/features/map/components/MapErrorOverlay.tsx` — accepts `visible: boolean`, `message: string | null`, `onRetry: () => void`; `absolute inset-0` positioned; shows error icon (lucide `AlertCircle`), message, shadcn `<Button>` "Retry"; calls `onRetry` on click; returns null when not visible
- [x] T024 [US1] Create `src/features/map/components/MapCore.tsx` — `'use client'`; uses react-leaflet `MapContainer` (named import aliased to `LeafletMapContainer` to avoid naming conflict), `TileLayer`, `ZoomControl` (position topright), `ScaleControl` (imperial false); renders active basemap tile layer from `mapStore.activeBasemapId`; on map `load` event → `setMapStatus('ready')`; on `tileerror` → `setError('Failed to load map tiles')`; includes `<CoordinatesTracker />` inner component using `useCoordinates`; subscribes to `dashboardStore.sidebarState` and calls `map.invalidateSize()` via `setTimeout(300)` after each change using `useMap()`
- [x] T025 [US1] Create `src/features/map/components/LayerSwitcher.tsx` — accepts `basemaps: readonly BasemapConfig[]`, `activeBasemapId: string`, `onBasemapChange: (id: string) => void`, `className?`; uses shadcn `DropdownMenu`; trigger has `aria-label="Switch basemap"`; active basemap highlighted with checkmark (lucide `Check`)
- [x] T026 [US1] Create `src/features/map/components/MapContainer.tsx` — server-safe; uses `next/dynamic(() => import('./MapCore'), { ssr: false })`; renders `<MapLoadingOverlay visible={isLoading} />` and `<MapErrorOverlay visible={isError} message={errorMessage} onRetry={retry} />`; `relative` wrapper so overlays stack; exports from `src/features/map/index.ts`
- [x] T027 [P] [US1] Create `src/features/dashboard/components/StatusBar.tsx` — reads `mapStore.lastKnownCoords`, `mapStore.zoom`, `mapStore.mapStatus`; displays `formatLatLng(lastKnownCoords)` and zoom; shows `"—"` when `mapStatus !== 'ready'`; coordinate `<span>` has `aria-live="polite"`; accepts `children?: React.ReactNode`
- [x] T028 [P] [US1] Create `src/features/dashboard/components/Toolbar.tsx` — `<nav aria-label="Toolbar">`; accepts `children?: React.ReactNode` and `className?`; empty in Phase 1
- [x] T029 [P] [US1] Create `src/features/dashboard/components/Navbar.tsx` — accepts `onMenuToggle: () => void`, `isMobile: boolean`, `children?: React.ReactNode`; logo "SpatialMind AI" left-aligned; `<Toolbar />` center; `children` slot right-aligned (for ThemeToggle); when `isMobile`: shows lucide `Menu` icon button calling `onMenuToggle`; `role="banner"`
- [x] T030 [US1] Create `src/features/dashboard/components/DashboardLayout.tsx` — CSS Grid `h-screen` or `h-dvh`; `grid-rows-[auto_1fr_auto]`; main area `grid-cols-[auto_1fr]`; composes `<Navbar>`, `<Sidebar>` (stub — just a `<aside>` for now), `<MapContainer className="h-full w-full" />`, `<StatusBar />`; imports `useSidebar` (will be wired in US3); no overflow
- [x] T031 [US1] Update `src/app/page.tsx` — replace all boilerplate; render `<DashboardLayout />`; verify at `http://localhost:3000` all four regions visible and map loads

**Checkpoint**: US1 complete and independently testable. Dashboard renders, map loads, coordinates display, layer switcher works. ✅

---

## Phase 4: User Story 2 — Dark / Light Theme Toggle (Priority: P2)

**Goal**: ThemeToggle in Navbar switches light/dark. Theme persists on refresh.

**Independent Test**: Click ThemeToggle → UI switches to dark. Refresh → dark persists. Click again → light returns.

### Implementation for User Story 2

- [X] T032 [P] [US2] Create `src/features/theme/hooks/useTheme.ts` — wraps `next-themes` `useTheme`; returns `{ theme, toggle, setTheme, isDark }`; `toggle()` switches between `'light'` and `'dark'`; `isDark` = `theme === 'dark'`
- [X] T033 [US2] Create `src/features/theme/components/ThemeToggle.tsx` — uses `useTheme`; shadcn `<Button variant="ghost" size="icon">`; shows lucide `Sun` when dark, `Moon` when light; `aria-pressed={isDark}`; `aria-label="Toggle dark mode"`; `className?` prop
- [X] T034 [US2] Add `<ThemeToggle />` to `src/features/dashboard/components/Navbar.tsx` (right slot); verify all four layout regions render correctly in both light and dark themes with Tailwind `dark:` variants; ensure no FOUC

**Checkpoint**: US2 complete. Theme toggle works; preference persists via next-themes localStorage. ✅

---

## Phase 5: User Story 3 — Collapsible Sidebar (Priority: P3)

**Goal**: Sidebar collapses to icon strip and expands. CSS animation ≤ 300 ms. Desktop preference persisted.

**Independent Test**: Click collapse control → sidebar narrows ≤ 300 ms → map expands. Click expand → sidebar returns. Map redraws correctly.

### Implementation for User Story 3

- [X] T035 [P] [US3] Create `src/features/dashboard/hooks/useBreakpoint.ts` — `useBreakpoint(maxWidth: number): boolean`; uses `window.matchMedia`; SSR-safe (returns `false` if window undefined); updates on resize via `addEventListener('change', ...)`
- [X] T036 [US3] Create `src/features/dashboard/hooks/useSidebar.ts` — reads/writes `dashboardStore`; integrates `useBreakpoint(767)`; `useEffect` on breakpoint change: when `isMobile` → `autoCollapseForMobile()`; when `!isMobile` → `restoreDesktopState()`; returns `{ sidebarState, isExpanded, toggle, autoCollapseForMobile, restoreDesktopState }`
- [X] T037 [P] [US3] Create `src/features/dashboard/components/SidebarToggle.tsx` — accepts `isExpanded: boolean`, `onToggle: () => void`, `className?`; shows lucide `ChevronLeft` when expanded, `ChevronRight` when collapsed; `aria-expanded={isExpanded}`; `aria-label` updates per state; shadcn `<Button variant="ghost" size="icon">`
- [X] T038 [US3] Create `src/features/dashboard/components/Sidebar.tsx` — accepts `state: SidebarState`, `onToggle: () => void`, `children?: React.ReactNode`; expanded width `w-64` (16rem), collapsed `w-14` (3.5rem); `transition-[width] duration-300 ease-in-out`; `overflow-hidden`; renders `<SidebarToggle>` at bottom; `<aside aria-label="Main navigation">`
- [X] T039 [US3] Wire `useSidebar` into `src/features/dashboard/components/DashboardLayout.tsx` — replace sidebar stub with `<Sidebar state={sidebarState} onToggle={toggle} />`; pass `isMobile` and `onMenuToggle` to `<Navbar>`; verify map redraws after toggle (MapCore already handles `invalidateSize` via dashboardStore subscription from T024)

**Checkpoint**: US3 complete. Sidebar animates within 300 ms; map invalidates size after toggle. ✅

---

## Phase 6: User Story 4 — Responsive Mobile Layout (Priority: P4)

**Goal**: At < 768px sidebar is hidden; hamburger opens Sheet overlay. Layout works at 320px–1920px.

**Independent Test**: Open at 375px → sidebar hidden, hamburger visible. Tap hamburger → Sheet slides in. Tap outside → closes. Resize to desktop → sidebar reappears.

### Implementation for User Story 4

- [X] T040 [P] [US4] Create `src/features/dashboard/components/MobileNav.tsx` — uses shadcn `<Sheet side="left">`; accepts `isOpen: boolean`, `onClose: () => void`, `children?: React.ReactNode`; focus trap and Escape-to-close provided by Radix; `aria-modal` set by Radix
- [ ] T041 [US4] Update `src/features/dashboard/components/DashboardLayout.tsx` — add `isMobile` from `useBreakpoint(767)` and `mobileNavOpen` state; on mobile: show `<MobileNav>`, hide `<Sidebar>` (`hidden md:flex`); on desktop: show `<Sidebar>`, hide `<MobileNav>`; pass `isMobile` and `onMenuToggle` to `<Navbar>`
- [ ] T042 [US4] QA and fix layout at 320px, 768px, 1280px, 1920px — verify no horizontal overflow, all controls visible, StatusBar text does not clip, map fills available space; modify `DashboardLayout.tsx`, `Navbar.tsx`, `StatusBar.tsx` as needed

**Checkpoint**: US4 complete. Mobile navigation functional; layout responsive across all breakpoints. ✅

---

## Phase N: Polish & Cross-Cutting Concerns

- [ ] T043 [P] Add `aria-label` to Leaflet ZoomControl buttons in `src/features/map/components/MapCore.tsx` (use `map.zoomControl.getContainer()` refs or custom Leaflet control); verify Tab-reachable with visible focus ring
- [ ] T044 [P] Add skip link `<a href="#map" className="sr-only focus:not-sr-only">Skip to map</a>` to `src/app/layout.tsx` or `DashboardLayout.tsx`; verify Tab order: skip-link → Navbar → SidebarToggle → map controls → StatusBar
- [ ] T045 [P] Add `@media (prefers-reduced-motion: reduce) { * { transition: none !important; } }` override to `src/app/globals.css`; verify sidebar still collapses/expands without animation when motion reduced
- [ ] T046 Run `npx tsc --noEmit`; fix every error until exit code 0; no `@ts-ignore` or `any` types anywhere
- [ ] T047 Run `npx eslint src --max-warnings 0`; fix every warning and error until exit code 0
- [ ] T048 [P] Write `src/features/dashboard/__tests__/useSidebar.test.ts` — test: toggle changes state; toggle saves desktopPreference; autoCollapse does NOT change desktopPreference; restoreDesktop restores preference value


- [ ] T050 [P] Write `src/features/dashboard/__tests__/DashboardLayout.test.tsx` — RTL test; mock `next/dynamic` and `react-leaflet`; assert `role="banner"`, sidebar `<aside>`, map container div, StatusBar all present
- [ ] T051 Add `@next/bundle-analyzer` to `package.json` devDependencies; run `ANALYZE=true npm run build`; confirm Leaflet is NOT in the initial JS chunk; confirm initial bundle < 200 KB gzipped
- [ ] T052 Create `docs/deployment.md` — document all 5 security headers with exact values; document CSP `img-src` and `connect-src` entries for `*.tile.openstreetmap.org` and `server.arcgisonline.com`; instructions for `curl -I` header verification and securityheaders.com audit

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (T001–T008)**: T001 first; T002–T008 in parallel after T001
- **Foundational (T009–T016)**: All Setup complete → BLOCKS all user stories
- **US1 (T017–T031)**: Foundational complete; internal order: T017/T018/T019 in parallel → T020/T021/T022/T023 → T024/T025 → T026 → T027/T028/T029 → T030 → T031
- **US2 (T032–T034)**: T015 (ThemeProvider) + T029 (Navbar) complete
- **US3 (T035–T039)**: T018 (dashboardStore) + T030 (DashboardLayout) complete
- **US4 (T040–T042)**: T035 (useBreakpoint) + T036 (useSidebar) + T030 (DashboardLayout) complete
- **Polish (T043–T052)**: All user story phases complete

### Parallel Opportunities — US1

```
T017 ──┐
T018 ──┤
T019 ──┤──→ T020 → T024 ──┐
       │──→ T021 → T024    │
       │──→ T022 ──────────┤──→ T026 ──┐
       │──→ T023 ──────────┘           │──→ T030 → T031
       │──→ T027 ──────────────────────┤
       │──→ T028 → T029 ───────────────┘
       └──→ T025 → T026
```

---

## Implementation Strategy

### MVP First

1. Phase 1: Setup (T001–T008)
2. Phase 2: Foundational (T009–T016) — **CRITICAL, do not skip**
3. Phase 3: US1 (T017–T031) → **STOP and validate in browser**
4. Run `npx tsc --noEmit` — must be zero errors before continuing

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. US1 → working dashboard + map → **MVP** — validate independently
3. US2 → dark/light theme → validate independently
4. US3 → collapsible sidebar → validate independently
5. US4 → mobile responsive → validate independently
6. Polish → quality gates, tests, docs

### Key Implementation Notes

- Never import `leaflet` or `react-leaflet` outside of `MapCore.tsx` — SSR crash risk
- react-leaflet hooks (`useMap`, `useMapEvents`) MUST be called inside a react-leaflet `<MapContainer>` context
- next-themes requires `suppressHydrationWarning` on `<html>` — omitting causes hydration mismatch
- Zustand `persist` with localStorage requires `createJSONStorage(() => localStorage)` for SSR safety
- After each phase: run `npx tsc --noEmit` before moving on
- Commit after each user story checkpoint
