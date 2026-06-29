# Quickstart Validation Guide: Platform Foundation & Map Shell

**Feature**: 001-app-foundation
**Date**: 2026-06-29

This guide validates that the Phase 1 foundation is correctly implemented.
Run these checks in order after implementation is complete.

---

## Prerequisites

- Node.js 20+ installed
- Dependencies installed: `npm install`
- shadcn/ui components installed via CLI
- Development server runs without errors

---

## 1. Start the Development Server

```bash
npm run dev
```

Expected: Server starts on `http://localhost:3000` with no TypeScript or ESLint errors
in the terminal output.

---

## 2. Build Quality Gate (SC-006)

```bash
npm run build
```

Expected: Build completes successfully. Zero TypeScript errors. Zero ESLint warnings.

```bash
npx tsc --noEmit
npx eslint src --max-warnings 0
```

Both commands MUST exit with code `0`.

---

## 3. US1 — Dashboard Renders on Load

Open `http://localhost:3000` in Chrome at **1280×800**.

Verify visually:
- [ ] Top navigation bar is visible with logo and ThemeToggle
- [ ] Left sidebar is visible with a collapse toggle button
- [ ] Main area shows an interactive Leaflet map with OSM basemap
- [ ] Bottom status bar is visible

Move the cursor over the map:
- [ ] Status bar updates with latitude and longitude coordinates
- [ ] Coordinates update smoothly without jank

Click the zoom-in button:
- [ ] Map zooms in one level
- [ ] Scale bar and zoom controls remain visible

Open the layer switcher:
- [ ] Two basemap options are listed (OpenStreetMap, Satellite Imagery)
- [ ] Selecting "Satellite Imagery" replaces the basemap

**References**: See [spec.md](./spec.md) US1 acceptance scenarios · [store-api.md](./contracts/store-api.md) `mapStore`

---

## 4. US2 — Dark / Light Theme Toggle (SC-002)

Click the ThemeToggle button in the Navbar:
- [ ] All UI regions switch to dark styling
- [ ] No flash of unstyled content (FOUC) during transition
- [ ] Theme switch completes within 100 ms (use browser DevTools Performance tab)

Refresh the page:
- [ ] Dark mode is still active (preference restored from localStorage)

Click ThemeToggle again:
- [ ] App returns to light mode

**References**: [store-api.md](./contracts/store-api.md) `themeStore` · `spatialMind:theme` localStorage key

---

## 5. US3 — Collapsible Sidebar (SC-003)

Click the sidebar collapse toggle:
- [ ] Sidebar narrows to an icon-only strip within 300 ms
- [ ] Map viewport expands to fill the space
- [ ] Map re-renders correctly without distortion (invalidateSize called)

Click the toggle again:
- [ ] Sidebar expands to full width within 300 ms
- [ ] Navigation labels are visible

**Timing check**: Use browser DevTools → Performance → record the toggle click.
Verify the CSS transition completes within 300 ms.

**References**: [hook-api.md](./contracts/hook-api.md) `useSidebar` · [data-model.md](./data-model.md) SidebarState FSM

---

## 6. US4 — Responsive Mobile Layout (SC-005)

Use DevTools device emulation or resize browser to **375px width**:
- [ ] Sidebar is not visible
- [ ] Map fills the full width
- [ ] Hamburger / menu icon is visible in the Navbar

Tap the hamburger icon:
- [ ] A navigation panel (Sheet overlay) slides in over the map
- [ ] Tap outside the panel or press Escape
- [ ] Panel closes; full map is visible

Resize back to desktop width (≥ 768px):
- [ ] Sidebar reappears in its last desktop state
- [ ] No layout overflow or horizontal scroll

---

## 7. Map Loading State (FR-012)

Throttle the network to **Slow 3G** in DevTools → Network:
- [ ] Reload the page
- [ ] A centered spinner/skeleton overlay appears on the map viewport
- [ ] Overlay disappears once tiles finish loading
- [ ] Status bar shows "—" for coordinates and zoom until map is ready

---

## 8. Map Error State (FR-011)

In DevTools → Network: set **Offline** mode, then reload:
- [ ] Map viewport shows an error overlay with a "Retry" button
- [ ] Status bar shows "—" during error state

Re-enable network, click "Retry":
- [ ] Map reloads tiles without a full page refresh
- [ ] Overlay disappears when tiles load successfully

---

## 9. Accessibility Audit (SC-004)

In Chrome DevTools → Lighthouse → run **Accessibility** audit on `http://localhost:3000`:
- [ ] Score ≥ 90
- [ ] Zero critical violations

Manual keyboard check:
- [ ] Tab through all controls: skip link → Navbar → ThemeToggle → SidebarToggle → map controls → StatusBar
- [ ] Each focused element has a visible focus ring
- [ ] ThemeToggle has `aria-pressed` state
- [ ] Sidebar toggle has `aria-expanded` state
- [ ] Coordinate display announces updates (test with VoiceOver / NVDA)

---

## 10. Responsive Breakpoints (SC-005)

Test at each breakpoint using DevTools device emulation:

| Viewport | Expected behavior |
|---|---|
| 320px | No horizontal scroll; map fills width; hamburger visible |
| 768px | Sidebar visible; layout transitions correctly |
| 1280px | Full desktop layout; sidebar expanded by default |
| 1920px | No layout overflow; map scales correctly |

---

## 11. Unit & Integration Tests

```bash
npm run test
```

Expected: All tests pass. Coverage ≥ 80% on hooks in `features/`.

---

## 12. E2E Tests

```bash
npx playwright test
```

Expected: All Playwright specs pass across Chromium, Firefox, and WebKit.
Key specs:
- `dashboard-loads.spec.ts`
- `theme-toggle.spec.ts`
- `sidebar-collapse.spec.ts`
- `mobile-layout.spec.ts`
- `map-error.spec.ts`
- `map-loading.spec.ts`

---

## 13. Bundle Analysis

```bash
ANALYZE=true npm run build
```

Verify in the bundle analyzer report:
- [ ] Leaflet is NOT present in the initial JS bundle
- [ ] Initial JS bundle < 200 KB gzipped
- [ ] Leaflet appears as a separate dynamic chunk

---

## 14. Security Headers (SC-007, NFR-001/002)

Deploy to staging and run:

```bash
curl -I https://your-staging-url.com
```

Verify all five headers are present:
- [ ] `Strict-Transport-Security`
- [ ] `Content-Security-Policy`
- [ ] `X-Frame-Options: DENY`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`

Use [securityheaders.com](https://securityheaders.com) for a full graded audit.

**References**: [data-model.md](./data-model.md) CSP Requirements · See `next.config.ts` headers() config

---

## Completion Criteria

All of the following MUST be true before Phase 1 is considered complete:

- [ ] `npm run build` exits with code 0 (zero TS errors, zero ESLint warnings)
- [ ] All unit + integration tests pass
- [ ] All Playwright E2E specs pass
- [ ] Lighthouse Accessibility ≥ 90
- [ ] Leaflet absent from initial bundle
- [ ] Security headers present in staging deployment
- [ ] All acceptance scenarios in spec.md verified manually or via E2E
