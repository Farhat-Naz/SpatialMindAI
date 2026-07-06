# Implementation Plan: Intelligent Search & Geospatial Intelligence

**Branch**: `002-search` | **Date**: 2026-07-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-search/spec.md`

---

## Summary

Add a keyboard-accessible place-search experience (type-ahead suggestions, map flyTo
navigation, marker placement, locally-persisted recent searches) and map-click reverse
geocoding, on top of the completed Phase 1 dashboard/map shell. All external geocoding
calls are proxied through two new Next.js Route Handlers (`GET /api/search`,
`GET /api/reverse-geocode`) that call **Nominatim** (OpenStreetMap) server-side, so no
provider credential or third-party host is ever reachable from the browser. The feature
is implemented as a single new module, `src/features/search/`, following the same
feature-first pattern established in Phase 1, and introduces no new mandated
technology — it composes the existing Next.js/React/Zustand/React Query/Leaflet/
shadcn stack.

---

## Technical Context

**Language/Version**: TypeScript 5 (strict mode — inherited, unchanged from Phase 1)

**Primary Dependencies**:
- next@15 (App Router + Route Handlers)
- react@19 / react-dom@19
- zustand@5 (new `searchStore` slice)
- @tanstack/react-query@5 (first real usage — idle since Phase 1)
- react-leaflet@5 / leaflet@1.9 (existing `MapCore`, extended with a search marker
  layer and a reverse-geocode click handler)
- shadcn/ui `Command` (built on `cmdk`) — new component installed via shadcn CLI
- zod (new — Route Handler input validation, per Constitution Principle IX)
- lucide-react (icons: Search, MapPin, X, Loader2, AlertCircle)

**Storage**: Browser `localStorage` for recent searches (via Zustand `persist`
middleware, same pattern as Phase 1's `themeStore`) — no server-side database. Route
Handlers are stateless proxies with a short-lived in-memory response cache (see
Research Decision 5); no persistent server storage is introduced.

**Testing**: Vitest + React Testing Library for unit/component/integration tests
(Constitution Principle VIII); Vitest also used to test Route Handlers directly
(request-in/response-out, no HTTP server needed) and custom hooks via
`@testing-library/react`'s `renderHook`.

**Target Platform**: Unchanged from Phase 1 — modern browsers (last 2 stable Chrome,
Firefox, Edge, Safari), served via Next.js 15 on a Node.js runtime (Route Handlers
require Node.js APIs for the outbound `fetch` with a custom `User-Agent` header).

**Project Type**: Web application — single Next.js app. This phase adds a
backend-for-frontend surface (`app/api/search/`, `app/api/reverse-geocode/`) to the
same app; there is no separate backend service or repo.

**Performance Goals**:
- Suggestions rendered within 500 ms (perceived) of typing pause (SM-002)
- Map flyTo animation completes within 2 s (SM-003)
- Reverse-geocode result returned within 2 s for on-land coordinates (SM-006)
- Route Handler round trip budget: ≤ 400 ms server-side processing excluding the
  upstream Nominatim network call itself

**Constraints**:
- 300 ms debounce before issuing a suggestion request (FR-003)
- Minimum 2-character query before any network call (FR-005)
- Nominatim usage policy: ~1 request/second upstream, custom `User-Agent` required
  (Non-functional Requirements > Security/Reliability)
- New feature code MUST add ≤ 20 KB gzipped to the initial route bundle (SM-008)
- WCAG 2.2 AA compliance (SM-007)
- Fully usable at 320 px viewport width (Constitution Principle XVI)

**Scale/Scope**: Single-user browser app, no authentication. Adds exactly one feature
module (`features/search/`) and two Route Handlers. No database migration, no
multi-tenant concerns.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design — see
bottom of this section.*

| Principle | Check | Notes |
|---|---|---|
| I. Feature-Based Architecture | ✅ PASS | All new code lives under `src/features/search/`; Route Handlers under `app/api/search/`, `app/api/reverse-geocode/` mirror the feature per Principle XII |
| II. Strict TypeScript | ✅ PASS | `SearchResult`, `RecentSearch`, `ReverseGeocodeResult`, `GeocodingProvider` all explicitly typed; zero `any` |
| III. Separation of Concerns | ✅ PASS | Components render only; `hooks/` own behavior; `services/` wrap Route Handler calls; `stores/` own the only mutation path |
| IV. State Management Rules | ✅ PASS | React Query owns search/reverse-geocode server state; Zustand owns query text, dropdown/highlight, recent searches, selected location |
| V. API Architecture (BFF) | ✅ PASS | Nominatim is called only from `features/search/api/` (server-only), invoked by the two Route Handlers; no client code reaches it directly |
| VI. Accessibility | ✅ PASS | shadcn/ui `Command` (Radix/cmdk) provides combobox semantics + focus management; WCAG 2.2 AA target explicit in spec |
| VII. Performance | ✅ PASS | `cmdk`-based Command adds ~6 KB gzipped, under the 20 KB budget; no SSR-unsafe module introduced (no `dynamic()` needed for this feature) |
| VIII. Testing Standards | ✅ PASS | Unit/component/integration/hook/API test tiers planned per Testing Strategy section below |
| IX. Security | ✅ PASS | Zod validation at both Route Handlers; no secret/key involved (Nominatim is keyless); CSP unaffected since the client never calls Nominatim directly |
| X. Documentation Requirements | ✅ PASS | Feature `README.md` planned in tasks; JSDoc required on all exported hooks/services |
| XI. Code Review Standards | ✅ PASS | Standard PR gate applies; no exception requested |
| XII. Folder Structure Conventions | ✅ PASS | See Project Structure below; one noted deviation (`store/` singular) is called out under Research Decision 2 |
| XIII. Naming Conventions | ✅ PASS | `useSearch`, `useSearchHistory`, `useReverseGeocode`, `useDebounce`; `useSearchStore`; `SearchResult`/`RecentSearch`/`ReverseGeocodeResult` types |
| XIV. Error Handling Strategy | ✅ PASS | Typed `{ error: { code, message } }` shape; explicit error UI states per FR-011/012; feature wrapped in an error boundary |
| XV. Logging Strategy | ✅ PASS | Route Handlers log method/path/status/duration via the shared logger; no PII (queries are not user-identifying) beyond what's already handled generically |
| XVI. Responsive-First Design | ✅ PASS | Search UI usable at 320 px; touch targets ≥ 44×44 px |
| XVII. Production Readiness | ✅ PASS | Quality gates (typecheck, lint, 3 test tiers, Lighthouse ≥ 90, bundle-analyzer) apply before merge |
| XVIII. AI Integration Guidelines | ✅ PASS (N/A this phase) | No AI feature is built here; the `GeocodingProvider` interface and Route Handler pattern this phase establishes are exactly what Principle XVIII expects a future AI feature to reuse |

**No violations — Complexity Tracking table not required.**

**Re-check after Phase 1 design (below)**: Confirmed still PASS — the `GeocodingProvider`
interface (Research Decision 3) and Zod validation (Research Decision 6) added during
design strengthen, rather than weaken, Principles V and IX.

---

## Project Structure

### Documentation (this feature)

```text
specs/002-search/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── api-contracts.md     # Route Handler request/response contracts
│   ├── component-api.md     # Component prop contracts
│   ├── hook-api.md          # Hook signature contracts
│   └── store-api.md         # searchStore shape/actions contract
├── checklists/
│   └── requirements.md
└── tasks.md              # Generated by /speckit-tasks (NOT this command)
```

### Source Code (repository root)

```text
src/
├── features/
│   └── search/                       # This feature — everything else in
│   │                                  # src/ is unchanged from Phase 1
│       ├── api/                      # Server-only: provider adapters, called
│       │   │                         # by Route Handlers (never by client code)
│       │   ├── provider.types.ts     # GeocodingProvider interface
│       │   ├── nominatimProvider.ts  # Default provider implementation
│       │   └── getGeocodingProvider.ts  # Factory (swap point for future providers)
│       │
│       ├── components/
│       │   ├── SearchBox.tsx         # Input + shadcn Command shell
│       │   ├── SearchResults.tsx     # Result list container (loading/error/empty/list)
│       │   ├── SearchResultItem.tsx  # Single result row
│       │   ├── SearchHistory.tsx     # Recent-searches list (shown on empty query)
│       │   ├── SearchLoading.tsx     # Shared loading indicator
│       │   ├── SearchEmptyState.tsx  # "No results" / "Start typing" states
│       │   ├── SearchErrorState.tsx  # Error state + Retry (required by FR-011;
│       │   │                         # not in the original component list but
│       │   │                         # needed to satisfy the Error State FRs)
│       │   └── ReverseGeocodePopup.tsx  # Map-click popup for US5 (also not in
│       │                               # the original list; required by US5/FR-024)
│       │
│       ├── hooks/
│       │   ├── useSearch.ts          # React Query: debounced query → SearchResult[]
│       │   ├── useSearchHistory.ts   # Zustand-backed recent-searches accessor
│       │   ├── useReverseGeocode.ts  # React Query: lat/lng → ReverseGeocodeResult
│       │   └── useMapSearchIntegration.ts  # Wires selection/click → flyTo + marker
│       │
│       ├── services/
│       │   ├── searchService.ts      # fetch wrapper: GET /api/search
│       │   ├── reverseGeocodeService.ts  # fetch wrapper: GET /api/reverse-geocode
│       │   └── queryKeys.ts          # Centralized React Query key factory
│       │
│       ├── store/                    # Singular, per Constitution Principle XII
│       │   └── searchStore.ts        # Zustand: query, dropdown, highlight,
│       │                             # recentSearches (persisted), selectedLocation
│       │
│       ├── types/
│       │   └── search.types.ts       # SearchResult, RecentSearch,
│       │                             # ReverseGeocodeResult, SearchApiError
│       │
│       ├── utils/
│       │   ├── formatDistance.ts     # Display helpers (e.g., result subtitle)
│       │   └── highlightMatch.ts     # Bold the matched substring in a result label
│       │
│       ├── __tests__/                # Unit/component/integration tests (co-located)
│       │
│       └── index.ts                  # Public barrel (SearchBox, ReverseGeocodePopup
│                                      # exported; internals stay private)
│
└── shared/
    └── hooks/
        └── useDebounce.ts             # Generic — lives in shared/, not the feature
                                        # (see Research Decision 2); re-exported from
                                        # features/search/hooks/index.ts for convenience

app/
└── api/
    ├── search/
    │   └── route.ts                  # GET /api/search — thin, delegates to
    │                                  # features/search/api/
    └── reverse-geocode/
        └── route.ts                  # GET /api/reverse-geocode — thin, delegates
                                       # to features/search/api/
```

**Structure Decision**: Single Next.js app, extending the existing feature-first
`src/features/` layout with one new module (`search`) plus its two Route Handlers
under `app/api/`. No backend/frontend split — the Route Handlers *are* the backend
for this BFF-only integration, per Constitution Principle V.

---

## Architecture Overview

The search feature slots into the existing dashboard shell without changing Phase 1's
component tree shape — it adds one new control to the `Navbar`'s toolbar and one new
Leaflet layer inside `MapCore`, both driven by the new `searchStore` and React Query.

```
DashboardLayout (unchanged)
├── Navbar
│   └── Toolbar
│         └── SearchBox (NEW)  ──────────────→ searchStore (Zustand)
│               ├── SearchResults              │        │
│               │     ├── SearchLoading         │        │
│               │     ├── SearchErrorState       │        │
│               │     ├── SearchEmptyState        │        │
│               │     └── SearchResultItem[]        │      │
│               └── SearchHistory                    │     │
│                     └── SearchResultItem[] (reused)  │    │
├── Sidebar (unchanged)
├── MapContainer (unchanged wrapper)
│     └── MapCore (existing, extended)
│           ├── TileLayer, ZoomControl, ScaleControl (unchanged)
│           ├── SearchMarker (NEW — reads searchStore.selectedLocation)
│           ├── ReverseGeocodePopup (NEW — map click handler + popup)
│           └── useMapSearchIntegration (NEW hook — flyTo + invalidateSize
│                 coordination, mirrors Phase 1's sidebar-toggle → invalidateSize
│                 pattern)
└── StatusBar (unchanged component; reads updated mapStore.center/zoom after
      a search-driven or reverse-geocode-driven flyTo, per FR-026 — no StatusBar
      code changes needed since it already reads from mapStore reactively)
```

Data ownership stays cleanly split: `searchStore` (Zustand) never holds server
response data — it holds only the *selected* result/point (a single denormalized
object) and UI state. All *candidate* results (the live suggestion list, the reverse
geocode lookup) live exclusively in the React Query cache, keyed per
`services/queryKeys.ts`.

---

## Component Architecture

| Component | Responsibility |
|---|---|
| **SearchBox** | Renders the search input inside a shadcn `Command` shell (`shouldFilter={false}`, `loop`). Reads/writes `searchStore.query`. Delegates keyboard events to `cmdk`. Triggers `useSearch` (via `useDebounce`) and renders `SearchResults` or `SearchHistory` depending on whether `query` is empty. |
| **SearchResults** | Pure presentational switch over `useSearch`'s `{ isLoading, isError, data }`: renders `SearchLoading`, `SearchErrorState`, `SearchEmptyState`, or a list of `SearchResultItem`. Owns no state of its own. |
| **SearchResultItem** | Renders one result's `displayName`/`category`, applies `highlightMatch` against the current query, and calls a passed-in `onSelect(result)` callback on click/Enter — it does not know whether it's rendering a live result or a recent search. |
| **SearchHistory** | Reads `useSearchHistory()`, renders a `SearchResultItem` per recent entry (most-recent first) plus a "Clear history" action; shown by `SearchBox` when `query` is empty. |
| **SearchLoading** | Shared, stateless loading indicator (spinner + `role="status"`) reused by both search-suggestion and reverse-geocode loading states. |
| **SearchEmptyState** | Two stateless variants via a `variant` prop: `"no-results"` and `"start-typing"`. |
| **SearchErrorState** *(required by FR-011, not in the original list)* | Renders the typed API error message plus a **Retry** button that re-triggers the failed React Query. |
| **ReverseGeocodePopup** *(required by US5, not in the original list)* | A Leaflet `Popup` bound to the click-marker; renders the same `SearchLoading` / `SearchErrorState` / result layout as the search flow, dismissible via a close button and Escape (FR-024/FR-025). |

---

## Hooks

| Hook | Data source | Responsibility |
|---|---|---|
| **useSearch(query)** | **React Query** | Debounced-query → `SearchResult[]`. `enabled: query.trim().length >= 2`. Query key: `queryKeys.search(query)`. Calls `searchService.search`. |
| **useSearchHistory()** | **Zustand** (`searchStore.recentSearches`) | Read/add/reorder/clear recent searches. No network call — pure client-state accessor with the persisted slice. |
| **useReverseGeocode(point)** | **React Query** | `LatLng \| null` → `ReverseGeocodeResult \| null`. `enabled: point !== null`. Query key: `queryKeys.reverseGeocode(point)`. Calls `reverseGeocodeService.reverseGeocode`. |
| **useDebounce(value, delayMs)** | **Neither** (pure utility) | Generic debounced-value hook; lives in `shared/hooks/` per Principle I (not search-specific), re-exported by the feature for convenience. |
| **useMapSearchIntegration()** *(additional — glue hook)* | **Both** | Subscribes to `searchStore.selectedLocation` and `reverseGeocodePoint`; drives `map.flyTo()` and marker placement (US3/US5); the one place map-imperative calls happen, keeping `MapCore` declarative. |

---

## State Management

### Client/UI State — Zustand (`features/search/store/searchStore.ts`)

| Field | Type | Persisted? |
|---|---|---|
| `query` | `string` | No |
| `isDropdownOpen` | `boolean` | No |
| `highlightedIndex` | `number` | No |
| `selectedLocation` | `SearchResult \| ReverseGeocodeResult \| null` | No |
| `reverseGeocodePoint` | `LatLng \| null` | No |
| `recentSearches` | `RecentSearch[]` | **Yes** — `localStorage`, key `spatialMind:recentSearches`, same `persist` middleware pattern as Phase 1's `themeStore` |

Actions: `setQuery`, `openDropdown`/`closeDropdown`, `setHighlightedIndex`,
`selectLocation(result)`, `setReverseGeocodePoint(point)`, `addRecentSearch(entry)`,
`clearRecentSearches()`. All mutation goes through these actions — no component
reaches into store internals (Principle III).

### Server State — React Query

| Query Key | Returns | Notes |
|---|---|---|
| `['search', query, limit]` | `SearchResult[]` | `staleTime: 30_000` — identical queries within 30 s reuse cache, reducing upstream Nominatim load |
| `['reverseGeocode', lat, lng]` | `ReverseGeocodeResult \| null` | `staleTime: 300_000` — an address for fixed coordinates doesn't change; 5-minute cache is safe |

Loading/error state is read directly from React Query (`isLoading`, `isError`,
`error`) by components — it is **never** copied into `searchStore`, per Constitution
Principle IV.

---

## API Layer

Both Route Handlers are thin — they parse/validate the request, delegate to the
feature's server-only `api/` adapter, and shape the response. Neither contains
business logic beyond validation and error mapping.

```
React Component (SearchBox)
      │
      ▼
useSearch()  ────────────────────  React Query
      │                                │
      │ (cache miss / stale)           │ (cache hit → return immediately,
      ▼                                │  no network call)
searchService.search(query, limit)     │
      │  fetch('/api/search?q=...')    │
      ▼                                │
GET /api/search  (Route Handler)  ◄────┘
      │  1. Zod-validate q/limit
      │  2. getGeocodingProvider()
      ▼
NominatimProvider.search(query, limit)
      │  fetch(nominatim endpoint, { headers: { 'User-Agent': ... } })
      ▼
Nominatim (external, OpenStreetMap)
      │  JSON response (provider-specific shape)
      ▼
NominatimProvider maps → SearchResult[]
      │
      ▼
Route Handler returns { results: SearchResult[] }  (or { error })
      │
      ▼
React Query cache updated → SearchResults re-renders
```

The reverse-geocode flow mirrors this exactly, substituting
`GET /api/reverse-geocode`, `lat`/`lng` params, and `{ result: ReverseGeocodeResult | null }`.

---

## External Providers

Provider access is isolated behind a single interface so Nominatim can be replaced
without touching Route Handlers, services, hooks, or components:

```typescript
// features/search/api/provider.types.ts (shape only — no implementation code)
interface GeocodingProvider {
  search(query: string, limit: number): Promise<SearchResult[]>;
  reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null>;
}
```

- **Default provider**: `NominatimProvider` — calls OpenStreetMap's Nominatim
  `/search` and `/reverse` endpoints, sets the required `User-Agent` header, and maps
  Nominatim's response shape into `SearchResult`/`ReverseGeocodeResult`.
- **Selection point**: `getGeocodingProvider()` factory, called only from the two
  Route Handlers. Swapping providers means adding a new class implementing
  `GeocodingProvider` and changing one line in the factory — no change to the API
  contract, data model, or any client-side code.
- **Future providers** (not built this phase, but the interface already accommodates
  them): `ArcGISProvider`, `GooglePlacesProvider`, `MapboxProvider`. Provider-specific
  concerns (API keys, rate-limit shape, response mapping) stay entirely inside each
  provider implementation.

---

## Data Flow

### Sequence: Place Search (US1 + US2)

```
User types "par" in SearchBox
  → searchStore.setQuery("par")
  → useDebounce holds value for 300ms
  → (user keeps typing) "pari" → debounce timer resets
  → (user pauses) debounce fires with "pari"
  → useSearch("pari") — query.length >= 2, so React Query becomes enabled
  → React Query checks cache for ['search', 'pari', 8] — miss
  → searchService.search('pari', 8) → GET /api/search?q=pari&limit=8
  → Route Handler validates, calls NominatimProvider.search
  → Nominatim responds; Route Handler returns { results: [...] }
  → React Query caches under ['search', 'pari', 8], staleTime 30s
  → SearchResults renders SearchResultItem[] from `data.results`
  → aria-live region announces result count
```

### Sequence: Selecting a Result (US3 + US4)

```
User presses ArrowDown/ArrowUp to highlight a SearchResultItem, then Enter
  → SearchResultItem.onSelect(result) fires
  → searchStore.selectLocation(result)     [sets selectedLocation]
  → searchStore.addRecentSearch({ query, result, searchedAt: now })
      → recentSearches persisted to localStorage via Zustand persist middleware
  → useMapSearchIntegration observes selectedLocation change
      → map.flyTo([result.lat, result.lng], 16)   [fixed zoom, FR-019]
      → on 'moveend': place/replace SearchMarker at result coordinates
  → mapStore.center/zoom update (existing Phase 1 store)
  → StatusBar re-renders with new coordinates/zoom (FR-026) — no StatusBar changes
    needed; it already subscribes to mapStore
  → SearchBox closes the dropdown; focus returns to the search input
```

### Sequence: Reverse Geocoding (US5)

```
User clicks a point on the map (MapCore 'click' handler)
  → searchStore.setReverseGeocodePoint({ lat, lng })
  → ReverseGeocodePopup mounts at the clicked point, shows SearchLoading
  → useReverseGeocode({ lat, lng }) — React Query, enabled since point !== null
  → React Query checks cache for ['reverseGeocode', lat, lng] — miss
  → reverseGeocodeService.reverseGeocode(lat, lng)
      → GET /api/reverse-geocode?lat=...&lng=...
  → Route Handler validates coordinate range, calls
    NominatimProvider.reverseGeocode
  → Nominatim responds (or no match) → Route Handler returns
    { result: ReverseGeocodeResult | null }
  → React Query caches under ['reverseGeocode', lat, lng], staleTime 5min
  → ReverseGeocodePopup renders the address, or SearchEmptyState
    ("no address found") if result is null
  → User dismisses (close button or Escape)
      → searchStore.setReverseGeocodePoint(null)
      → popup and its marker unmount
```

---

## Error Handling

| Scenario | Strategy |
|---|---|
| **Network failure** (fetch rejects, timeout) | React Query retries up to 2 times with exponential backoff; on final failure, `isError` surfaces `SearchErrorState`/`ReverseGeocodePopup`'s error variant with a **Retry** action that re-invokes the query (Constitution Principle XIV). |
| **API rate limiting** | Route Handler enforces its own short-window limiter to stay within Nominatim's ~1 req/s policy (Research Decision 5); on limit, it returns `429 RATE_LIMITED` immediately (no upstream call attempted) so the client fails fast rather than queuing indefinitely. Client shows a distinct "Too many searches — please wait a moment" message, not the generic error state. |
| **Empty responses** | `results: []` or `result: null` are **200 OK**, not errors — rendered via `SearchEmptyState`, never `SearchErrorState` (FR-013, FR-025). |
| **Invalid queries** | Zod validation in the Route Handler rejects before any upstream call: missing/short `q` → `400 INVALID_QUERY`; out-of-range `lat`/`lng` → `400 INVALID_COORDINATES`. The client-side minimum-length guard (FR-005) means this should rarely be user-visible, but the server MUST NOT trust the client. |

Both Route Handlers are wrapped so an unexpected exception is caught and mapped to a
generic `502 PROVIDER_UNAVAILABLE` rather than leaking a stack trace (Principle XIV) —
no Route Handler may let an unhandled exception reach the client as a raw 500.

---

## Performance

- **React Query caching**: 30 s stale time on search results, 5 min on reverse-geocode
  results, sized to avoid redundant upstream Nominatim calls for repeated/rapid
  interactions (re-selecting a recent search, re-clicking a nearby point).
- **Debounce**: 300 ms via `useDebounce`, applied before the query key changes —
  ensures at most ~3 requests/second of typing collapse into one request per pause.
- **Lazy rendering**: Not required as a code-splitting concern — the search UI is
  small (~6–8 KB for `cmdk` + feature code) and stays within the initial bundle per
  Constitution Principle VII's "under ~50 KB" dynamic-import threshold; no
  `next/dynamic` wrapper is needed for this feature.
- **Memoization**: `SearchResultItem` wrapped in `React.memo` (keyed by result `id`
  and whether it is the currently highlighted index) so changing `highlightedIndex`
  re-renders only the two affected rows, not the whole list. `highlightMatch` output
  memoized per `(displayName, query)` pair.
- **Bundle splitting**: Verified via `@next/bundle-analyzer` before merge (SM-008);
  the shadcn `Command` component and its `cmdk` dependency are the only new
  dependency of note (~6 KB gzipped), comfortably under the 20 KB budget.

---

## Accessibility

- **Keyboard navigation**: shadcn's `Command` (built on `cmdk` with `loop` enabled)
  provides Up/Down/Enter/Escape handling, including the wrap-around behavior
  clarified in the spec (FR-006), without custom key-handling code.
- **Screen readers**: `Command`/`cmdk` already implements `role="combobox"` on the
  input and `role="listbox"`/`role="option"` on the results, satisfying Principle VI's
  ARIA requirement without additional markup. An `aria-live="polite"` region
  (separate from the listbox itself, per APG guidance) announces loading, result
  count, and error-state transitions so they're conveyed without stealing focus.
- **ARIA**: `ReverseGeocodePopup`'s close control carries `aria-label="Close address
  details"`; the reverse-geocode marker carries `aria-label` describing its resolved
  address once available.
- **Focus management**: Selecting a result or dismissing the reverse-geocode popup
  returns focus to the search input (US3/US5), never leaving focus on a now-unmounted
  element. Escape closes the open surface (dropdown or popup) without clearing typed
  query text (FR-007).

---

## Testing Strategy

| Tier | Coverage |
|---|---|
| **Unit** | `useDebounce`, `searchStore` actions (select/add/clear/reorder), `highlightMatch`, `formatDistance`, `NominatimProvider`'s response-mapping functions (pure, given a fixture Nominatim response) |
| **Component** | `SearchBox`, `SearchResults` (all four render variants), `SearchResultItem` (keyboard + click selection), `SearchHistory` (empty/populated/clear), `SearchLoading`, `SearchEmptyState`, `SearchErrorState` (Retry calls the passed handler), `ReverseGeocodePopup` |
| **Hook** | `useSearch` and `useReverseGeocode` against a mocked `searchService`/`reverseGeocodeService` (React Query test wrapper); verifies `enabled` gating (min length, non-null point) and cache-key correctness |
| **Integration** | Full US1–US5 flows with `fetch` mocked at the network boundary (e.g., MSW): type → suggestions → select → flyTo/marker/recent-search persisted; empty query → history shown; map click → reverse-geocode popup → dismiss |
| **API** | Both Route Handlers invoked directly (no HTTP server) with a mocked `GeocodingProvider`: valid request → 200 shape; invalid `q`/`lat`/`lng` → 400 with correct `code`; provider throws → 502; limiter tripped → 429 |

All new tests are co-located under `features/search/__tests__/`, per Constitution
Principle VIII; no test shares mutable global state (each resets `searchStore` and
the React Query `QueryClient` in `beforeEach`).

---

## Security

- **Input validation**: Zod schemas validate `q` (string, trimmed length ≥ 2),
  `limit` (number, clamped 1–10), `lat` (-90..90), `lng` (-180..180) inside each
  Route Handler before any upstream call (Constitution Principle IX).
- **Request sanitization**: Query strings are trimmed and stripped of control
  characters before being forwarded to Nominatim; `limit` is clamped server-side
  regardless of what the client requests.
- **Rate limiting strategy**: A short-window (per-process, in-memory) limiter throttles
  outbound Nominatim calls to ~1 req/s, with a small response cache (Research
  Decision 5) absorbing bursts of identical queries. This is explicitly scoped to a
  single-instance deployment; scaling to multiple instances would require moving the
  limiter/cache to a shared store (noted under Future Extensibility).
- **CSP considerations**: Because Nominatim is called only from the Route Handler
  (server-side), the browser's Content-Security-Policy `connect-src`/`img-src`
  directives from `next.config.ts` require **no new entries** for this feature — the
  client only ever calls same-origin `/api/search` and `/api/reverse-geocode`,
  already covered by `'self'`. This is a direct benefit of the BFF mandate
  (Principle V): unlike Phase 1's map tiles (which the browser must fetch directly),
  no external host needs to be added to the CSP allowlist for search.

---

## Future Extensibility

| Future Feature | How This Architecture Enables It |
|---|---|
| **AI location analysis** | An AI Route Handler (per Constitution Principle XVIII) can call the same `GeocodingProvider` interface to resolve place names mentioned in a user's natural-language query, reusing `SearchResult` as its output shape — no change to this feature's contracts. |
| **Route planning** | A future `features/routing/` module can consume `searchStore.selectedLocation` (or accept a `SearchResult` prop) as a waypoint input; no coupling is required beyond the already-shared `SearchResult` type. |
| **Weather layers** | Entirely independent Leaflet overlay feature; unaffected by and requires no changes to the search architecture. |
| **GeoJSON imports** | Reuses the same Route Handler BFF pattern (validate → process → typed response) established here, just with an upload/parsing Route Handler instead of a geocoding proxy. |
| **Multi-provider search** | Directly supported today via the `GeocodingProvider` interface — implement `ArcGISProvider`/`GooglePlacesProvider`/`MapboxProvider` and change `getGeocodingProvider()`'s selection logic (e.g., env-based). No Route Handler, service, hook, or component changes required. |

```
                    ┌─────────────────────────┐
                    │   GeocodingProvider      │  ← stable interface, this phase
                    │   (search, reverseGeocode)│
                    └─────────────┬─────────────┘
                 ┌────────────────┼────────────────┬─────────────────┐
                 ▼                ▼                ▼                 ▼
        NominatimProvider   ArcGISProvider   GooglePlacesProvider  MapboxProvider
         (this phase)         (future)            (future)            (future)
```

---

## Complexity Tracking

*No entries — Constitution Check reported no violations.*
