# Quickstart Validation Guide: Intelligent Search & Geospatial Intelligence

**Feature**: 002-search
**Date**: 2026-07-07

This guide validates that Phase 2 (search + reverse geocoding) is correctly
implemented, once `/speckit-implement` has completed the tasks generated from this
plan. Run these checks in order.

---

## Prerequisites

- Phase 1 (`001-app-foundation`) is implemented and its own quickstart passes
- Dependencies installed: `npm install` (including the new `zod` and shadcn
  `Command` component added for this phase)
- Development server runs without errors: `npm run dev`
- Outbound network access to `nominatim.openstreetmap.org` from the dev machine
  (Route Handlers call it server-side)

---

## 1. Build & Quality Gates (Constitution Principle XVII)

```bash
npx tsc --noEmit
npm run lint
npm run test
```

Expected: zero TypeScript errors, zero ESLint warnings, all three test tiers
(unit/component/integration) passing, per `plan.md`'s Testing Strategy.

```bash
ANALYZE=true npm run build
```

Expected: bundle-analyzer output shows the search feature's addition to the initial
route bundle at or under 20 KB gzipped (SM-008).

---

## 2. API Contract Validation (US1, US5)

With the dev server running:

```bash
curl "http://localhost:3000/api/search?q=paris"
```

Expected: `200 OK`, JSON body `{ "results": [...] }` with at least one result whose
`displayName` mentions Paris.

```bash
curl "http://localhost:3000/api/search?q=a"
```

Expected: `400`, `{ "error": { "code": "INVALID_QUERY", ... } }` (below minimum
length — matches FR-005 and the API contract).

```bash
curl "http://localhost:3000/api/reverse-geocode?lat=48.8566&lng=2.3522"
```

Expected: `200 OK`, `{ "result": { "displayName": ..., ... } }` describing central
Paris.

```bash
curl "http://localhost:3000/api/reverse-geocode?lat=999&lng=2.35"
```

Expected: `400`, `{ "error": { "code": "INVALID_COORDINATES", ... } }`.

---

## 3. Place Search Flow (US1 + US2 + US3)

1. Open `http://localhost:3000` in a browser.
2. Click/focus the search box in the Navbar.
3. Type `"par"` — expect **no** request yet (below 2-char minimum is satisfied at 3,
   so this should trigger after the 300 ms debounce).
4. Continue typing to `"paris"` before the debounce fires, then pause.
5. **Expected**: a single suggestion request fires only after the pause (verify in
   the Network tab — not one request per keystroke), a loading indicator appears
   briefly, then a result list appears within ~500 ms perceived delay (SM-002).
6. Press `ArrowDown` repeatedly past the last result.
   **Expected**: highlight wraps back to the first result (per Clarifications).
7. Press `Enter` on a highlighted result.
   **Expected**: the map animates (flyTo) to the result at zoom level 16 within 2 s
   (SM-003), a marker appears at that location, and the StatusBar's coordinate/zoom
   readout updates to match (FR-026).

---

## 4. Recent Searches (US4)

1. After completing step 3 above, clear the search box.
   **Expected**: the recent-searches list appears, showing the Paris search at the top.
2. Reload the page (`F5`).
   **Expected**: the recent search is still present (SM-005 — persisted across reload).
3. Click the recent entry.
   **Expected**: same flyTo/marker/StatusBar behavior as step 3.7 above, and the
   entry remains at the top of the list (not duplicated).

---

## 5. Reverse Geocoding (US5)

1. Click anywhere on land on the map (not through an open search dropdown).
   **Expected**: a popup appears at the clicked point showing a loading indicator,
   then an address within ~2 s (SM-006).
2. Click a point far out in the ocean.
   **Expected**: the popup shows a "no address found" empty state, not an error.
3. Dismiss the popup (close button or `Escape`).
   **Expected**: popup and its marker are removed; focus returns to a sane location
   (not lost to `<body>`).

---

## 6. Error State Validation

1. With the dev server running, temporarily block outbound access to
   `nominatim.openstreetmap.org` (e.g., via OS-level firewall rule or by editing
   `/etc/hosts` to an invalid IP) and repeat step 3 of Section 3.
   **Expected**: after retries are exhausted, an explicit error state with a
   **Retry** button appears — never a silent blank result area (FR-011/FR-012).
2. Restore network access and click **Retry**.
   **Expected**: the same query succeeds normally.

---

## 7. Accessibility Spot-Check (SM-007)

1. Run an automated accessibility audit (e.g., axe DevTools) against the dashboard
   with the search dropdown open.
   **Expected**: zero critical/serious violations.
2. Using only the keyboard (Tab, Arrow keys, Enter, Escape), complete the full flow
   in Section 3 without touching the mouse.
   **Expected**: every step is reachable and operable; focus is always visibly
   indicated.

---

## Success Criteria Checklist

- [ ] All three test tiers pass (`npm run test`)
- [ ] Zero TypeScript/ESLint errors
- [ ] Bundle addition ≤ 20 KB gzipped
- [ ] Both Route Handlers return correct success and error shapes (Section 2)
- [ ] US1–US5 manual flows behave as described (Sections 3–5)
- [ ] Error state + Retry verified (Section 6)
- [ ] Zero critical/serious accessibility violations (Section 7)
