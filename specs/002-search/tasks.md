---
description: "Task list for Intelligent Search & Geospatial Intelligence (Phase 2)"
---

# Tasks: Intelligent Search & Geospatial Intelligence

**Input**: Design documents from `specs/002-search/`

**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/ ✅ · quickstart.md ✅

**Organization**: Tasks are grouped into technical milestones (Phase A–K), per explicit
request for this phase. This deviates from the standard "one phase per user story"
default layout used in Phase 1 — every task still carries a `[Story]` label (US1–US5)
mapping it back to `spec.md`, so story-level traceability and independent testability
are preserved; see **Dependencies & Execution Order** for how the two views reconcile.
Tasks with no natural single-story owner (accessibility/performance/testing/docs
polish) carry no `[Story]` label, consistent with how Phase 1's Polish phase tasks
were left untagged.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1 (Place Search) · US2 (Search Suggestions) · US3 (Map Navigation) ·
  US4 (Recent Searches) · US5 (Reverse Geocoding) — omitted for cross-cutting tasks
- Every task lists exact file paths, a one-line Acceptance Criteria, and a
  Verification checklist, in addition to the standard checkbox line
- Every task is scoped to ~10–20 minutes of focused work on a single concern

---

## Phase A: Search Foundation

**Purpose**: Types, provider interface, provider implementation, validation
schemas, and configuration that every later phase depends on.

⚠️ **CRITICAL**: No Route Handler, hook, or component work starts until this phase
is complete.

- [X] T001 [P] [US1] Scaffold `src/features/search/` folder structure: `api/`, `components/`, `hooks/`, `services/`, `store/`, `types/`, `utils/`, `__tests__/`
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/search/{api,components,hooks,services,store,types,utils,__tests__}/`
  - **Acceptance Criteria**: All eight subdirectories exist matching `plan.md`'s Project Structure exactly
  - **Verification**:
    - [ ] Folder tree diff matches `plan.md` Project Structure section
    - [ ] `tsc --noEmit` still passes (no broken imports introduced)

- [X] T002 [P] [US1] Create `src/features/search/types/search.types.ts` — `SearchResult` interface
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/search/types/search.types.ts`
  - **Acceptance Criteria**: `SearchResult` matches the shape fixed in `spec.md` Data Model exactly (id, displayName, lat, lng, boundingBox?, category?, importance?)
  - **Verification**:
    - [ ] No `any` used
    - [ ] Field types match `data-model.md` Entity: SearchResult table

- [X] T003 [P] [US4] Add `RecentSearch` interface to `src/features/search/types/search.types.ts`
  - **User Story**: US4 — Recent Searches
  - **Priority**: P4
  - **Files**: `src/features/search/types/search.types.ts`
  - **Acceptance Criteria**: `RecentSearch` has `id`, `query`, `result: SearchResult`, `searchedAt: string`
  - **Verification**:
    - [ ] `searchedAt` typed as ISO 8601 string, not `Date`
    - [ ] No duplicate type declarations

- [X] T004 [P] [US5] Add `ReverseGeocodeResult` interface to `src/features/search/types/search.types.ts`
  - **User Story**: US5 — Reverse Geocoding
  - **Priority**: P5
  - **Files**: `src/features/search/types/search.types.ts`
  - **Acceptance Criteria**: Matches `data-model.md` Entity: ReverseGeocodeResult, including optional nested `address` object
  - **Verification**:
    - [ ] All `address` sub-fields are optional
    - [ ] Matches `spec.md` Data Model verbatim

- [X] T005 [P] [US1] Add `SearchApiError` type to `src/features/search/types/search.types.ts`
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/search/types/search.types.ts`
  - **Acceptance Criteria**: `code` is a closed union of the four documented error codes; `message: string`
  - **Verification**:
    - [ ] Union includes `INVALID_QUERY | INVALID_COORDINATES | PROVIDER_UNAVAILABLE | RATE_LIMITED`
    - [ ] Exported from the feature's public barrel is NOT required (internal type)

- [X] T006 [P] [US1] Create `src/features/search/api/provider.types.ts` — `GeocodingProvider` interface
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/search/api/provider.types.ts`
  - **Acceptance Criteria**: Interface declares `search(query, limit)` and `reverseGeocode(lat, lng)` matching `plan.md`'s External Providers section
  - **Verification**:
    - [ ] Return types are `Promise<SearchResult[]>` / `Promise<ReverseGeocodeResult | null>`
    - [ ] No implementation logic in this file — types only

- [X] T007 [US1] Create `src/features/search/api/config.ts` — reads `NOMINATIM_BASE_URL`/rate-limit env vars with defaults
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/search/api/config.ts`
  - **Acceptance Criteria**: Exports a typed config object; falls back to `https://nominatim.openstreetmap.org` and a documented default rate limit if env vars are unset
  - **Verification**:
    - [ ] No secret values hardcoded
    - [ ] Config is read once at module scope, not per-request

- [X] T008 [P] Add search-related environment variables to `.env.example`
  - **User Story**: Cross-cutting (supports US1, US5)
  - **Priority**: N/A
  - **Files**: `.env.example`
  - **Acceptance Criteria**: `NOMINATIM_BASE_URL`, `SEARCH_USER_AGENT`, `SEARCH_RATE_LIMIT_PER_SECOND` all present with inline comments explaining purpose
  - **Verification**:
    - [ ] No real secrets committed (Nominatim needs none, but pattern must stay clean for future providers)
    - [ ] Matches variable names used in `config.ts` (T007)

- [X] T009 [US1] Create `src/features/search/api/schemas.ts` — `searchQuerySchema` (Zod)
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/search/api/schemas.ts`
  - **Acceptance Criteria**: Validates `q` (trimmed length ≥ 2) and `limit` (number, clamped 1–10, default 8)
  - **Verification**:
    - [ ] Rejects whitespace-only `q`
    - [ ] `limit` above 10 is clamped, not rejected

- [X] T010 [US5] Add `reverseGeocodeQuerySchema` (Zod) to `src/features/search/api/schemas.ts`
  - **User Story**: US5 — Reverse Geocoding
  - **Priority**: P5
  - **Files**: `src/features/search/api/schemas.ts`
  - **Acceptance Criteria**: Validates `lat` (-90..90) and `lng` (-180..180), both required numbers
  - **Verification**:
    - [ ] Out-of-range values fail validation
    - [ ] Missing params fail validation with a clear message

- [X] T011 [US1] Create `src/features/search/api/validateRequest.ts` — generic `parseOrError(schema, params)` helper
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/search/api/validateRequest.ts`
  - **Acceptance Criteria**: Returns either `{ success: true, data }` or `{ success: false, error: SearchApiError }`, mapping Zod issues to a user-safe `message`
  - **Verification**:
    - [ ] Never returns a raw Zod error object to the caller
    - [ ] Reusable by both Route Handlers without modification

- [X] T012 [US1] Create `src/features/search/api/nominatimProvider.ts` — `search()` implementation calling Nominatim `/search`
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/search/api/nominatimProvider.ts`
  - **Acceptance Criteria**: Sets the required `User-Agent` header from `config.ts`; implements `GeocodingProvider.search`
  - **Verification**:
    - [ ] `User-Agent` header present on every outbound request
    - [ ] Function signature matches `GeocodingProvider` exactly

- [X] T013 [US1] Add search response-mapping function to `nominatimProvider.ts` — raw Nominatim JSON → `SearchResult[]`
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/search/api/nominatimProvider.ts`
  - **Acceptance Criteria**: Maps `place_id`→`id`, `display_name`→`displayName`, `lat`/`lon`→`lat`/`lng` (parsed to numbers), `boundingbox`→`boundingBox` tuple
  - **Verification**:
    - [ ] Handles a Nominatim response missing `boundingbox` without throwing
    - [ ] Output strictly matches the `SearchResult` type (no extra fields)

---

## Phase A (continued): Provider Registry & Rate Limiting

- [X] T014 [US5] Add `reverseGeocode()` implementation to `nominatimProvider.ts` — calls Nominatim `/reverse`
  - **User Story**: US5 — Reverse Geocoding
  - **Priority**: P5
  - **Files**: `src/features/search/api/nominatimProvider.ts`
  - **Acceptance Criteria**: Implements `GeocodingProvider.reverseGeocode`, reusing the same `User-Agent` config as `search()`
  - **Verification**:
    - [ ] Returns `null` (not a thrown error) when Nominatim reports no result
    - [ ] Shares HTTP client setup with `search()` (no duplicated fetch config)

- [X] T015 [US5] Add reverse-geocode response-mapping function to `nominatimProvider.ts`
  - **User Story**: US5 — Reverse Geocoding
  - **Priority**: P5
  - **Files**: `src/features/search/api/nominatimProvider.ts`
  - **Acceptance Criteria**: Maps `display_name`→`displayName`, `lat`/`lon`→`lat`/`lng`, `address.*`→`ReverseGeocodeResult.address.*`
  - **Verification**:
    - [ ] All `address` sub-fields optional-safe (no crash on missing keys)
    - [ ] Output strictly matches `ReverseGeocodeResult`

- [X] T016 [US1] Create `src/features/search/api/getGeocodingProvider.ts` — factory returning the active provider
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/search/api/getGeocodingProvider.ts`
  - **Acceptance Criteria**: Returns a `NominatimProvider` instance by default; documented as the single swap point for future providers
  - **Verification**:
    - [ ] Only this file and Route Handlers may import `nominatimProvider.ts` directly
    - [ ] Matches `plan.md`'s External Providers factory description

- [X] T017 [US1] Create `src/features/search/api/rateLimiter.ts` — sliding-window limiter + short-TTL cache
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/search/api/rateLimiter.ts`
  - **Acceptance Criteria**: Enforces ~1 request/second to Nominatim per Research Decision 5; exposes a simple `checkLimit()`/`getCached()`/`setCached()` API
  - **Verification**:
    - [ ] Limiter state is per-process in-memory (documented limitation, not a bug)
    - [ ] Cache TTL is short (seconds, not minutes) to avoid stale duplicate-query results

---

## Phase B: Route Handlers

**Purpose**: The backend-for-frontend layer (Constitution Principle V) — the only
code paths permitted to reach Nominatim.

⚠️ **CRITICAL**: Requires Phase A complete (provider, schemas, validation, limiter).

- [X] T018 [US1] Create `app/api/search/route.ts` — GET handler skeleton reading `q`/`limit`
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `app/api/search/route.ts`
  - **Acceptance Criteria**: Handler exists, reads `URL` search params, does not yet call the provider
  - **Verification**:
    - [ ] File compiles under strict TypeScript
    - [ ] No business logic beyond param extraction at this step

- [X] T019 [US1] Wire Zod validation into `app/api/search/route.ts`
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `app/api/search/route.ts`
  - **Acceptance Criteria**: Invalid `q`/`limit` returns `400` with `{ error: { code: "INVALID_QUERY", message } }`
  - **Verification**:
    - [ ] Matches `contracts/api-contracts.md` error shape exactly
    - [ ] Valid input passes through unchanged to the next step

- [X] T020 [US1] Wire rate limiter into `app/api/search/route.ts`
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `app/api/search/route.ts`
  - **Acceptance Criteria**: When the limiter reports over-budget, returns `429 RATE_LIMITED` **before** any provider call is attempted
  - **Verification**:
    - [ ] No upstream Nominatim call occurs on a rate-limited request
    - [ ] Cached result (if present) is returned as a `200` instead of hitting the limiter

- [X] T021 [US1] Wire `getGeocodingProvider().search()` into `app/api/search/route.ts`
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `app/api/search/route.ts`
  - **Acceptance Criteria**: Successful call returns `200 { results: SearchResult[] }` matching `contracts/api-contracts.md`
  - **Verification**:
    - [ ] Response shape matches contract exactly (no extra top-level fields)
    - [ ] `limit` is passed through to the provider call

- [X] T022 [US1] Add error mapping in `app/api/search/route.ts`
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `app/api/search/route.ts`
  - **Acceptance Criteria**: Any unexpected exception is caught and returns `502 { error: { code: "PROVIDER_UNAVAILABLE", message } }`, never a raw stack trace
  - **Verification**:
    - [ ] Simulated provider throw returns 502, not a 500 with stack trace
    - [ ] `message` is a static, user-safe string

- [X] T023 [US5] Create `app/api/reverse-geocode/route.ts` — GET handler skeleton reading `lat`/`lng`
  - **User Story**: US5 — Reverse Geocoding
  - **Priority**: P5
  - **Files**: `app/api/reverse-geocode/route.ts`
  - **Acceptance Criteria**: Handler exists, reads and parses `lat`/`lng` as numbers
  - **Verification**:
    - [ ] Non-numeric input does not crash the handler at this step (guarded by T024 next)
    - [ ] File compiles under strict TypeScript

- [X] T024 [US5] Wire Zod validation into `app/api/reverse-geocode/route.ts`
  - **User Story**: US5 — Reverse Geocoding
  - **Priority**: P5
  - **Files**: `app/api/reverse-geocode/route.ts`
  - **Acceptance Criteria**: Invalid/out-of-range `lat`/`lng` returns `400 { error: { code: "INVALID_COORDINATES", message } }`
  - **Verification**:
    - [ ] Matches `contracts/api-contracts.md` exactly
    - [ ] Boundary values (exactly -90/90/-180/180) are accepted, not rejected

- [X] T025 [US5] Wire rate limiter into `app/api/reverse-geocode/route.ts`
  - **User Story**: US5 — Reverse Geocoding
  - **Priority**: P5
  - **Files**: `app/api/reverse-geocode/route.ts`
  - **Acceptance Criteria**: Same `429 RATE_LIMITED` behavior as the search handler, sharing the `rateLimiter.ts` module
  - **Verification**:
    - [ ] Search and reverse-geocode share the same limiter budget (both count against the ~1 req/s Nominatim policy)
    - [ ] No duplicate limiter implementation created

- [X] T026 [US5] Wire `getGeocodingProvider().reverseGeocode()` into `app/api/reverse-geocode/route.ts`
  - **User Story**: US5 — Reverse Geocoding
  - **Priority**: P5
  - **Files**: `app/api/reverse-geocode/route.ts`
  - **Acceptance Criteria**: Returns `200 { result: ReverseGeocodeResult | null }`; `null` is a success case, not an error
  - **Verification**:
    - [ ] A "no address found" scenario returns 200 with `result: null`, never a 4xx/5xx
    - [ ] Response shape matches `contracts/api-contracts.md`

- [X] T027 [US5] Add error mapping in `app/api/reverse-geocode/route.ts`
  - **User Story**: US5 — Reverse Geocoding
  - **Priority**: P5
  - **Files**: `app/api/reverse-geocode/route.ts`
  - **Acceptance Criteria**: Same `502 PROVIDER_UNAVAILABLE` behavior as the search handler
  - **Verification**:
    - [ ] Simulated provider throw returns 502
    - [ ] No stack trace leaked in `message`

- [X] T028 [P] [US1] Wire structured request logging into `app/api/search/route.ts`
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `app/api/search/route.ts`
  - **Acceptance Criteria**: Logs method, path, status code, and duration in JSON via the shared logger (Constitution Principle XV)
  - **Verification**:
    - [ ] No query text or PII logged beyond what's already generically permitted
    - [ ] Log line includes a duration measured from handler entry to response

- [X] T029 [P] [US5] Wire structured request logging into `app/api/reverse-geocode/route.ts`
  - **User Story**: US5 — Reverse Geocoding
  - **Priority**: P5
  - **Files**: `app/api/reverse-geocode/route.ts`
  - **Acceptance Criteria**: Same structured logging shape as the search handler
  - **Verification**:
    - [ ] Uses the same shared logger module (no duplicate logging utility)
    - [ ] Coordinates are logged only at a level appropriate for debugging, not as PII

---

## Phase C: React Query Integration

**Purpose**: Server-state layer connecting the UI to the Route Handlers.

⚠️ Requires Phase B complete (both Route Handlers functional).

- [X] T030 [US1] Create `src/features/search/services/queryKeys.ts` — centralized key factory
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/search/services/queryKeys.ts`
  - **Acceptance Criteria**: Exports `queryKeys.search(query, limit)` and `queryKeys.reverseGeocode(lat, lng)` as typed tuple factories
  - **Verification**:
    - [ ] No other file constructs a React Query key by hand
    - [ ] Keys are stable/serializable (no functions or class instances inside)

- [X] T031 [US1] Create `src/features/search/services/searchService.ts` — fetch wrapper for `GET /api/search`
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/search/services/searchService.ts`
  - **Acceptance Criteria**: `search(query, limit)` returns `Promise<SearchResult[]>`; throws a typed `SearchApiError` on non-2xx
  - **Verification**:
    - [ ] Only this service (and no component/hook) calls `fetch('/api/search')` directly
    - [ ] Error thrown preserves the Route Handler's `code`/`message`

- [X] T032 [US5] Create `src/features/search/services/reverseGeocodeService.ts` — fetch wrapper for `GET /api/reverse-geocode`
  - **User Story**: US5 — Reverse Geocoding
  - **Priority**: P5
  - **Files**: `src/features/search/services/reverseGeocodeService.ts`
  - **Acceptance Criteria**: `reverseGeocode(lat, lng)` returns `Promise<ReverseGeocodeResult | null>`
  - **Verification**:
    - [ ] `null` result is returned normally, not thrown as an error
    - [ ] Only this service calls `fetch('/api/reverse-geocode')` directly

- [X] T033 [US1] Create `src/features/search/hooks/useSearch.ts`
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/search/hooks/useSearch.ts`
  - **Acceptance Criteria**: React Query hook; `enabled: query.trim().length >= 2`; `staleTime: 30_000`; uses `queryKeys.search`
  - **Verification**:
    - [ ] Query does not fire for a 1-character (or empty) query
    - [ ] Matches `contracts/hook-api.md` signature exactly

- [X] T034 [US5] Create `src/features/search/hooks/useReverseGeocode.ts`
  - **User Story**: US5 — Reverse Geocoding
  - **Priority**: P5
  - **Files**: `src/features/search/hooks/useReverseGeocode.ts`
  - **Acceptance Criteria**: React Query hook; `enabled: point !== null`; `staleTime: 300_000`; uses `queryKeys.reverseGeocode`
  - **Verification**:
    - [ ] Query does not fire when `point` is `null`
    - [ ] `data === null` is distinguishable from `data === undefined` at the call site

- [X] T035 [US1] Configure retry policy on `useSearch`
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/search/hooks/useSearch.ts`
  - **Acceptance Criteria**: Max 2 retries with exponential backoff; 4xx responses (e.g., `INVALID_QUERY`) are never retried
  - **Verification**:
    - [ ] Simulated 400 response results in zero retries
    - [ ] Simulated 502 response results in up to 2 retries before surfacing `isError`

- [X] T036 [US5] Configure retry policy on `useReverseGeocode`
  - **User Story**: US5 — Reverse Geocoding
  - **Priority**: P5
  - **Files**: `src/features/search/hooks/useReverseGeocode.ts`
  - **Acceptance Criteria**: Same retry semantics as `useSearch`
  - **Verification**:
    - [ ] Simulated 400 response results in zero retries
    - [ ] Retry backoff timing matches `useSearch`'s configuration (consistent UX)

- [X] T037 [P] [US1] Add JSDoc summaries to `searchService.ts` and `queryKeys.ts`
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/search/services/searchService.ts`, `src/features/search/services/queryKeys.ts`
  - **Acceptance Criteria**: Every exported function/const has a single-line JSDoc summary (Constitution Principle X)
  - **Verification**:
    - [ ] No exported symbol lacks a JSDoc line
    - [ ] Summaries state behavior, not restate the function name

- [X] T038 [P] [US5] Add JSDoc summaries to `reverseGeocodeService.ts`
  - **User Story**: US5 — Reverse Geocoding
  - **Priority**: P5
  - **Files**: `src/features/search/services/reverseGeocodeService.ts`
  - **Acceptance Criteria**: Same JSDoc coverage standard as T037
  - **Verification**:
    - [ ] No exported symbol lacks a JSDoc line
    - [ ] Consistent phrasing style with `searchService.ts`

---

## Phase D: Zustand Store

**Purpose**: Client/UI state — the only mutation path for search UI state
(Constitution Principle IV).

- [X] T039 [US1] Create `src/features/search/store/searchStore.ts` — initial state shape
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/search/store/searchStore.ts`
  - **Acceptance Criteria**: State fields `query`, `isDropdownOpen`, `highlightedIndex`, `selectedLocation`, `reverseGeocodePoint`, `recentSearches` all declared with correct defaults
  - **Verification**:
    - [ ] Matches `contracts/store-api.md`'s `SearchStoreState` exactly
    - [ ] No action logic yet — state shape only at this step

- [X] T040 [US1] Add `setQuery` action to `searchStore.ts`
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/search/store/searchStore.ts`
  - **Acceptance Criteria**: `setQuery(query: string)` updates `query` only
  - **Verification**:
    - [ ] Does not mutate any other field as a side effect
    - [ ] No trimming/validation logic here (that belongs to the Route Handler/hook layer)

- [X] T041 [US1] Add `openDropdown`/`closeDropdown` actions to `searchStore.ts`
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/search/store/searchStore.ts`
  - **Acceptance Criteria**: Two actions toggling `isDropdownOpen` independently of `query`
  - **Verification**:
    - [ ] `closeDropdown` does not clear `query`
    - [ ] Both actions are pure state setters, no side effects

- [X] T042 [US2] Add `setHighlightedIndex` action to `searchStore.ts`
  - **User Story**: US2 — Search Suggestions
  - **Priority**: P2
  - **Files**: `src/features/search/store/searchStore.ts`
  - **Acceptance Criteria**: `setHighlightedIndex(index: number)` updates `highlightedIndex` only
  - **Verification**:
    - [ ] Accepts `-1` (no highlight) as a valid value
    - [ ] No bounds-clamping logic here (owned by `cmdk`/component layer)

- [X] T043 [US3] Add `selectLocation` action to `searchStore.ts`
  - **User Story**: US3 — Map Navigation
  - **Priority**: P3
  - **Files**: `src/features/search/store/searchStore.ts`
  - **Acceptance Criteria**: Sets `selectedLocation`; MUST also clear `reverseGeocodePoint` to `null` (single-active-marker invariant)
  - **Verification**:
    - [ ] Calling `selectLocation` while `reverseGeocodePoint` is set clears the point
    - [ ] Matches the invariant documented in `contracts/store-api.md`

- [X] T044 [US5] Add `setReverseGeocodePoint` action to `searchStore.ts`
  - **User Story**: US5 — Reverse Geocoding
  - **Priority**: P5
  - **Files**: `src/features/search/store/searchStore.ts`
  - **Acceptance Criteria**: Setting a non-null point MUST clear `selectedLocation`; setting `null` clears only the point
  - **Verification**:
    - [ ] Calling with a point while `selectedLocation` is set clears the location
    - [ ] Calling with `null` does not touch `selectedLocation`

- [X] T045 [US4] Add `addRecentSearch` action to `searchStore.ts` — dedup + move-to-top logic
  - **User Story**: US4 — Recent Searches
  - **Priority**: P4
  - **Files**: `src/features/search/store/searchStore.ts`
  - **Acceptance Criteria**: Re-selecting an existing `result.id` moves it to the top with a refreshed `searchedAt`, does not duplicate
  - **Verification**:
    - [ ] Selecting the same result twice yields a list of length 1, not 2
    - [ ] `searchedAt` reflects the most recent selection time

- [X] T046 [US4] Add max-10-entries eviction to `addRecentSearch` in `searchStore.ts`
  - **User Story**: US4 — Recent Searches
  - **Priority**: P4
  - **Files**: `src/features/search/store/searchStore.ts`
  - **Acceptance Criteria**: Inserting an 11th distinct entry evicts the oldest by `searchedAt`
  - **Verification**:
    - [ ] List length never exceeds 10
    - [ ] The evicted entry is always the least-recently-searched one

- [X] T047 [US4] Add `clearRecentSearches` action to `searchStore.ts`
  - **User Story**: US4 — Recent Searches
  - **Priority**: P4
  - **Files**: `src/features/search/store/searchStore.ts`
  - **Acceptance Criteria**: Resets `recentSearches` to `[]`; no other field affected
  - **Verification**:
    - [ ] Persisted `localStorage` value is also cleared (not just in-memory state)
    - [ ] Does not affect `selectedLocation`/`reverseGeocodePoint`

- [X] T048 [US4] Wire Zustand `persist` middleware into `searchStore.ts`
  - **User Story**: US4 — Recent Searches
  - **Priority**: P4
  - **Files**: `src/features/search/store/searchStore.ts`
  - **Acceptance Criteria**: Only `recentSearches` is persisted, to `localStorage` key `spatialMind:recentSearches`, using `createJSONStorage(() => localStorage)` for SSR safety
  - **Verification**:
    - [ ] Reloading the page retains `recentSearches` but resets all other fields
    - [ ] No SSR hydration warning introduced

---

## Phase E: UI Components

**Purpose**: Presentational components and the SearchBox composition
(Constitution Principle III — components render only).

⚠️ Requires Phase C (hooks) and Phase D (store) complete.

- [X] T049 [P] [US1] Install shadcn `Command` component via CLI
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/shared/components/ui/command.tsx` (generated by CLI)
  - **Acceptance Criteria**: `npx shadcn@latest add command` completes; component compiles under strict TypeScript
  - **Verification**:
    - [ ] `cmdk` appears as a new dependency in `package.json`
    - [ ] No manual edits needed to the generated file to compile

- [X] T050 [US1] Create `src/features/search/components/SearchInput.tsx`
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/search/components/SearchInput.tsx`
  - **Acceptance Criteria**: Wraps shadcn's `CommandInput`; controlled by `searchStore.query`; calls `setQuery` on every change
  - **Verification**:
    - [ ] Purely presentational — no direct `fetch`/React Query usage
    - [ ] Placeholder text matches spec's UX intent ("Search places…")

- [X] T051 [US1] Create `src/features/search/components/SearchBox.tsx` — shadcn `Command` shell
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/search/components/SearchBox.tsx`
  - **Acceptance Criteria**: Renders `Command` with `loop` enabled and `shouldFilter={false}`; composes `SearchInput`
  - **Verification**:
    - [ ] `loop` prop present (enables FR-006 wrap-around via `cmdk`)
    - [ ] `shouldFilter={false}` set (filtering is server-side, not client-side)

- [X] T052 [US2] Wire `useDebounce` into `SearchBox.tsx`
  - **User Story**: US2 — Search Suggestions
  - **Priority**: P2
  - **Files**: `src/features/search/components/SearchBox.tsx`
  - **Acceptance Criteria**: `query` is debounced at 300 ms before being passed to `useSearch` (FR-003)
  - **Verification**:
    - [ ] Rapid typing produces at most one request per pause, verified via Network tab
    - [ ] Debounce delay is exactly 300 ms, not an approximation

- [X] T053 [US1] Add minimum-query-length gating to `SearchBox.tsx`
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/search/components/SearchBox.tsx`
  - **Acceptance Criteria**: Below 2 trimmed characters, `useSearch` is not invoked and `SearchHistory` renders instead of live results (FR-005)
  - **Verification**:
    - [ ] Typing a single character never triggers a network request
    - [ ] Whitespace-only input is treated as empty (FR-002)

- [X] T054 [P] [US1] Create `src/features/search/components/SearchLoading.tsx`
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/search/components/SearchLoading.tsx`
  - **Acceptance Criteria**: Stateless spinner with `role="status"`; accepts a `label` prop for accessible naming
  - **Verification**:
    - [ ] Reused (not duplicated) by both search and reverse-geocode loading states
    - [ ] No hardcoded color values (Tailwind semantic tokens only)

- [X] T055 [P] [US1] Create `src/features/search/components/SearchEmptyState.tsx`
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/search/components/SearchEmptyState.tsx`
  - **Acceptance Criteria**: `variant: "no-results" | "start-typing"` renders distinct, correct copy for each (FR-013/FR-014)
  - **Verification**:
    - [ ] `"no-results"` echoes the query text in its message when `query` prop is passed
    - [ ] Visually distinct from `SearchLoading` and `SearchErrorState`

- [X] T056 [P] [US1] Create `src/features/search/components/SearchErrorState.tsx`
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/search/components/SearchErrorState.tsx`
  - **Acceptance Criteria**: Renders `error.message` and a Retry button calling `onRetry` (FR-011)
  - **Verification**:
    - [ ] Retry button is keyboard-focusable and triggers `onRetry` on Enter/click
    - [ ] `RATE_LIMITED` errors render distinct copy from other error codes

- [X] T057 [US1] Create `src/features/search/utils/highlightMatch.ts`
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/search/utils/highlightMatch.ts`
  - **Acceptance Criteria**: Pure function; given `(text, query)`, returns segments marking the matched substring
  - **Verification**:
    - [ ] Case-insensitive matching
    - [ ] Returns the original text unchanged when there is no match

- [X] T058 [US1] Create `src/features/search/components/SearchResultItem.tsx`
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/search/components/SearchResultItem.tsx`
  - **Acceptance Criteria**: Renders `displayName` (via `highlightMatch`) and `category`; calls `onSelect(result)` on click/Enter; no internal state
  - **Verification**:
    - [ ] Fully keyboard-operable (Enter selects the highlighted item)
    - [ ] Reusable identically by `SearchResults` and `SearchHistory`

- [X] T059 [US1] Create `src/features/search/components/SearchResults.tsx`
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/search/components/SearchResults.tsx`
  - **Acceptance Criteria**: Calls `useSearch`; switches between `SearchLoading`/`SearchErrorState`/`SearchEmptyState`/a list of `SearchResultItem` based on query state
  - **Verification**:
    - [ ] Exactly one of the four render variants is shown at any time
    - [ ] No results data is duplicated into `searchStore` (React Query remains the source of truth)

- [X] T060 [US4] Create `src/features/search/components/SearchHistory.tsx`
  - **User Story**: US4 — Recent Searches
  - **Priority**: P4
  - **Files**: `src/features/search/components/SearchHistory.tsx`
  - **Acceptance Criteria**: Reads `useSearchHistory()`; renders `SearchResultItem` per entry (most recent first) plus a "Clear history" action; renders `null` when empty
  - **Verification**:
    - [ ] Empty list renders nothing (not an empty-state message — that's a different condition per spec Edge Cases)
    - [ ] "Clear history" is keyboard-reachable

- [X] T061 [US1] Wire `SearchResults`/`SearchHistory` conditional rendering into `SearchBox.tsx`
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/search/components/SearchBox.tsx`
  - **Acceptance Criteria**: Empty query → `SearchHistory`; non-empty (≥2 chars) query → `SearchResults`
  - **Verification**:
    - [ ] Switching between the two states does not cause a layout jump
    - [ ] Focus remains in the input throughout

- [X] T062 [US1] Create `src/features/search/utils/formatDistance.ts`
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/search/utils/formatDistance.ts`
  - **Acceptance Criteria**: Pure helper producing a result subtitle string (e.g., category/context text)
  - **Verification**:
    - [ ] Returns an empty string (not `undefined`) when no subtitle data is available
    - [ ] No side effects, no I/O

- [X] T063 [US3] Wire `onSelect` handler in `SearchBox.tsx`
  - **User Story**: US3 — Map Navigation
  - **Priority**: P3
  - **Files**: `src/features/search/components/SearchBox.tsx`
  - **Acceptance Criteria**: Calls `searchStore.selectLocation(result)` and `addRecentSearch(query, result)`, closes the dropdown, returns focus to `SearchInput`
  - **Verification**:
    - [ ] Both store actions fire exactly once per selection
    - [ ] Focus is verifiably back on the input after selection (not lost to `<body>`)

- [X] T064 [P] [US2] Add `React.memo` to `SearchResultItem.tsx`
  - **User Story**: US2 — Search Suggestions
  - **Priority**: P2
  - **Files**: `src/features/search/components/SearchResultItem.tsx`
  - **Acceptance Criteria**: Memoized on `result.id` and `isHighlighted`; changing `highlightedIndex` re-renders only the affected rows
  - **Verification**:
    - [ ] React DevTools profiler confirms only 1–2 rows re-render on arrow-key navigation
    - [ ] No stale closure bugs introduced by memoization

- [X] T065 [US1] Mount `<SearchBox />` inside `src/features/dashboard/components/Toolbar.tsx`
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/dashboard/components/Toolbar.tsx`
  - **Acceptance Criteria**: Search box is visible and functional in the Navbar's toolbar at all viewport widths ≥ 320 px
  - **Verification**:
    - [ ] No layout regression to existing Navbar/Toolbar content
    - [ ] Search box does not overflow at 320 px width

- [X] T066 [US1] Export `SearchBox` from `src/features/search/index.ts`
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/search/index.ts`
  - **Acceptance Criteria**: `SearchBox` is the only component exported for consumption outside the feature (plus `ReverseGeocodePopup`, added in T072)
  - **Verification**:
    - [ ] No internal component/hook/store is exported from the barrel
    - [ ] `Toolbar.tsx` imports only from `@/features/search`, never a deep path

- [X] T067 [US5] Create `src/features/search/components/ReverseGeocodePopup.tsx`
  - **User Story**: US5 — Reverse Geocoding
  - **Priority**: P5
  - **Files**: `src/features/search/components/ReverseGeocodePopup.tsx`
  - **Acceptance Criteria**: Calls `useReverseGeocode(point)`; renders `SearchLoading`/`SearchErrorState`/address/`SearchEmptyState("no-results")` per state
  - **Verification**:
    - [ ] Dismiss control calls `onClose` and nothing else
    - [ ] Reuses `SearchLoading`/`SearchErrorState`/`SearchEmptyState` rather than duplicating markup

- [X] T068 [US5] Export `ReverseGeocodePopup` from `src/features/search/index.ts`
  - **User Story**: US5 — Reverse Geocoding
  - **Priority**: P5
  - **Files**: `src/features/search/index.ts`
  - **Acceptance Criteria**: `ReverseGeocodePopup` is importable by `MapCore.tsx` via the public barrel only
  - **Verification**:
    - [ ] `MapCore.tsx` does not deep-import from `features/search/components/`
    - [ ] Barrel exports remain limited to these two components plus necessary types

---

## Phase F: Map Integration

**Purpose**: Wiring search/reverse-geocode selections to Leaflet's imperative API
(`flyTo`, markers, click handling) without making `MapCore` stateful about search.

⚠️ Requires Phase D (store) and Phase E (components) complete.

- [X] T069 [US3] Create `src/features/search/hooks/useMapSearchIntegration.ts` — skeleton subscribing to store
  - **User Story**: US3 — Map Navigation
  - **Priority**: P3
  - **Files**: `src/features/search/hooks/useMapSearchIntegration.ts`
  - **Acceptance Criteria**: Hook subscribes to `searchStore.selectedLocation` and `reverseGeocodePoint`; no map calls yet
  - **Verification**:
    - [ ] Must be called from within a react-leaflet `MapContainer` context
    - [ ] No direct Leaflet import outside `features/map/` or this hook

- [X] T070 [US3] Implement `map.flyTo()` call in `useMapSearchIntegration.ts`
  - **User Story**: US3 — Map Navigation
  - **Priority**: P3
  - **Files**: `src/features/search/hooks/useMapSearchIntegration.ts`
  - **Acceptance Criteria**: On `selectedLocation` change, calls `map.flyTo([lat, lng], 16)` (fixed zoom per FR-019)
  - **Verification**:
    - [ ] Zoom level is always exactly 16, regardless of result type
    - [ ] Animation completes within 2 seconds (SM-003) in manual testing

- [X] T071 [US3] Create `src/features/search/components/SearchMarker.tsx`
  - **User Story**: US3 — Map Navigation
  - **Priority**: P3
  - **Files**: `src/features/search/components/SearchMarker.tsx`
  - **Acceptance Criteria**: Renders a Leaflet marker at `selectedLocation`'s coordinates when non-null
  - **Verification**:
    - [ ] Renders nothing when `selectedLocation` is `null`
    - [ ] Marker position updates reactively on selection change

- [X] T072 [US3] Implement replace-not-duplicate marker logic in `SearchMarker.tsx`
  - **User Story**: US3 — Map Navigation
  - **Priority**: P3
  - **Files**: `src/features/search/components/SearchMarker.tsx`
  - **Acceptance Criteria**: Selecting a new result removes the previous marker before/while placing the new one (FR-018)
  - **Verification**:
    - [ ] At most one search marker exists on the map at any time
    - [ ] No memory leak from unremoved previous marker instances

- [X] T073 [US3] Wire flyTo-interrupt handling in `useMapSearchIntegration.ts`
  - **User Story**: US3 — Map Navigation
  - **Priority**: P3
  - **Files**: `src/features/search/hooks/useMapSearchIntegration.ts`
  - **Acceptance Criteria**: Manual map drag/zoom during an in-progress flyTo cancels the animation gracefully (FR-020)
  - **Verification**:
    - [ ] Map is left in a consistent, interactive state after an interrupted flyTo
    - [ ] No console error/warning on interruption

- [X] T074 [US5] Add map `click` event handler in `src/features/map/components/MapCore.tsx`
  - **User Story**: US5 — Reverse Geocoding
  - **Priority**: P5
  - **Files**: `src/features/map/components/MapCore.tsx`
  - **Acceptance Criteria**: Map click calls `searchStore.setReverseGeocodePoint({ lat, lng })`
  - **Verification**:
    - [ ] Click coordinates match the clicked point precisely (no offset bug)
    - [ ] Existing zoom/pan click behavior is unaffected

- [X] T075 [US5] Guard reverse-geocode click handler for in-progress flyTo
  - **User Story**: US5 — Reverse Geocoding
  - **Priority**: P5
  - **Files**: `src/features/map/components/MapCore.tsx`
  - **Acceptance Criteria**: Clicks during an active flyTo animation are ignored (spec Edge Cases)
  - **Verification**:
    - [ ] Clicking mid-animation produces no popup and no store update
    - [ ] Clicking immediately after animation settles works normally

- [X] T076 [US5] Mount `<ReverseGeocodePopup>` inside `MapCore.tsx`
  - **User Story**: US5 — Reverse Geocoding
  - **Priority**: P5
  - **Files**: `src/features/map/components/MapCore.tsx`
  - **Acceptance Criteria**: Popup is bound to `reverseGeocodePoint`, positioned at the clicked coordinates
  - **Verification**:
    - [ ] Popup does not render when `reverseGeocodePoint` is `null`
    - [ ] Popup position matches the clicked point, not the map center

- [X] T077 [US5] Wire popup dismiss to clear `reverseGeocodePoint`
  - **User Story**: US5 — Reverse Geocoding
  - **Priority**: P5
  - **Files**: `src/features/map/components/MapCore.tsx`, `src/features/search/components/ReverseGeocodePopup.tsx`
  - **Acceptance Criteria**: Close button and `Escape` key both call `setReverseGeocodePoint(null)`
  - **Verification**:
    - [ ] Popup and its marker are removed from the DOM after dismiss
    - [ ] Escape does not also clear the search box's `query`

- [X] T078 [US1] Verify `StatusBar.tsx` reflects post-navigation `mapStore` state
  - **User Story**: US1 — Place Search
  - **Priority**: P1
  - **Files**: `src/features/dashboard/components/StatusBar.tsx` (verification only — no change expected)
  - **Acceptance Criteria**: Coordinate/zoom readout updates immediately after a search-driven or reverse-geocode-driven flyTo (FR-026)
  - **Verification**:
    - [ ] Manual check: StatusBar shows zoom 16 and correct coordinates after a search selection
    - [ ] If a gap is found, file it as a new task rather than silently patching `StatusBar.tsx` here

---

## Phase G: Recent Searches (End-to-End Wiring)

**Purpose**: Wire the store/persistence logic from Phase D into the actual
`SearchBox`/`SearchHistory` interaction flow.

- [X] T079 [US4] Wire `SearchHistory` visibility trigger on input focus
  - **User Story**: US4 — Recent Searches
  - **Priority**: P4
  - **Files**: `src/features/search/components/SearchBox.tsx`
  - **Acceptance Criteria**: Focusing the empty search input shows `SearchHistory` immediately, without requiring a keystroke
  - **Verification**:
    - [ ] Tab-focusing the input (keyboard-only) also triggers this
    - [ ] Does not show `SearchHistory` if `query` is non-empty

- [X] T080 [US4] Verify persisted `recentSearches` rehydrate correctly on page load
  - **User Story**: US4 — Recent Searches
  - **Priority**: P4
  - **Files**: `src/features/search/store/searchStore.ts` (verification only)
  - **Acceptance Criteria**: A full page reload preserves the recent-searches list and its order (SM-005)
  - **Verification**:
    - [ ] Manual reload test in a real browser confirms persistence
    - [ ] Order (most-recent-first) is preserved across reload

- [X] T081 [US4] Wire "Clear history" button in `SearchHistory.tsx`
  - **User Story**: US4 — Recent Searches
  - **Priority**: P4
  - **Files**: `src/features/search/components/SearchHistory.tsx`
  - **Acceptance Criteria**: Clicking "Clear history" calls `clearRecentSearches()` and the list disappears immediately
  - **Verification**:
    - [ ] `localStorage` entry is also cleared, not just in-memory state
    - [ ] No confirmation dialog required (not specified by spec) but action is clearly labeled

- [X] T082 [US4] Verify re-selection-moves-to-top behavior end-to-end
  - **User Story**: US4 — Recent Searches
  - **Priority**: P4
  - **Files**: `src/features/search/components/SearchBox.tsx` (verification only)
  - **Acceptance Criteria**: Re-selecting an existing recent entry moves it to the top without duplicating (FR-022)
  - **Verification**:
    - [ ] Manual test: select A, select B, re-select A → order is [A, B]
    - [ ] List length never grows from a re-selection

- [X] T083 [US4] Add graceful `localStorage`-unavailable fallback
  - **User Story**: US4 — Recent Searches
  - **Priority**: P4
  - **Files**: `src/features/search/store/searchStore.ts`
  - **Acceptance Criteria**: In private browsing or quota-exceeded scenarios, the feature degrades to in-memory-only history without throwing
  - **Verification**:
    - [ ] Simulated `localStorage.setItem` throw does not crash the app
    - [ ] Recent searches still work for the remainder of the session

- [X] T084 [US4] Verify recent-search keyboard accessibility via shared `SearchResultItem`
  - **User Story**: US4 — Recent Searches
  - **Priority**: P4
  - **Files**: `src/features/search/components/SearchHistory.tsx` (verification only)
  - **Acceptance Criteria**: Recent entries are keyboard-navigable/selectable identically to live search results
  - **Verification**:
    - [ ] Arrow keys + Enter work on recent entries with no separate code path
    - [ ] Wrap-around behavior (FR-006) also applies within the history list

- [X] T085 [US4] Add a component test placeholder check for `SearchHistory` empty/populated/clear states
  - **User Story**: US4 — Recent Searches
  - **Priority**: P4
  - **Files**: `src/features/search/components/SearchHistory.tsx` (verification only — actual test written in Phase J, T109)
  - **Acceptance Criteria**: Manual smoke check of all three states (empty, populated, post-clear) before formal test authoring
  - **Verification**:
    - [ ] All three states visually confirmed in a running dev server
    - [ ] No console errors/warnings in any of the three states

---

## Phase H: Accessibility

**Purpose**: WCAG 2.2 AA compliance verification and remediation
(Constitution Principle VI).

- [X] T086 [P] Add `aria-live="polite"` announcement region to `SearchResults.tsx`
  - **User Story**: Cross-cutting (supports US1, US2)
  - **Priority**: N/A
  - **Files**: `src/features/search/components/SearchResults.tsx`
  - **Acceptance Criteria**: Loading, result-count, and error transitions are announced without stealing focus
  - **Verification**:
    - [ ] Screen reader (e.g., VoiceOver/NVDA spot check) announces "3 results found" or equivalent
    - [ ] Region does not duplicate announcements on unrelated re-renders

- [X] T087 [P] Verify `role="combobox"`/`role="listbox"` semantics remain intact
  - **User Story**: Cross-cutting (supports US1, US2)
  - **Priority**: N/A
  - **Files**: `src/features/search/components/SearchBox.tsx`, `src/features/search/components/SearchResults.tsx`
  - **Acceptance Criteria**: shadcn `Command`'s default ARIA roles are not overridden or broken by custom wrapper markup
  - **Verification**:
    - [ ] Browser accessibility tree inspector confirms `combobox`/`listbox`/`option` roles present
    - [ ] No `role` attribute manually duplicated/conflicting

- [X] T088 [P] Add `aria-label="Close address details"` to `ReverseGeocodePopup.tsx`
  - **User Story**: Cross-cutting (supports US5)
  - **Priority**: N/A
  - **Files**: `src/features/search/components/ReverseGeocodePopup.tsx`
  - **Acceptance Criteria**: Close button has the exact label specified in `contracts/component-api.md`
  - **Verification**:
    - [ ] Label is announced correctly by a screen reader
    - [ ] Button is reachable via Tab

- [X] T089 [P] Add descriptive `aria-label` to the reverse-geocode marker
  - **User Story**: Cross-cutting (supports US5)
  - **Priority**: N/A
  - **Files**: `src/features/search/components/ReverseGeocodePopup.tsx`
  - **Acceptance Criteria**: Once an address resolves, the marker/popup carries an `aria-label` describing it
  - **Verification**:
    - [ ] Label updates when a new point is clicked
    - [ ] No stale label persists from a previous click

- [X] T090 Verify focus returns to `SearchInput` after result selection
  - **User Story**: Cross-cutting (supports US3)
  - **Priority**: N/A
  - **Files**: `src/features/search/components/SearchBox.tsx` (verification only)
  - **Acceptance Criteria**: Keyboard focus is demonstrably back on the input immediately after Enter-selecting a result
  - **Verification**:
    - [ ] `document.activeElement` check confirms the input in a manual/automated test
    - [ ] No intermediate focus loss to `<body>`

- [X] T091 Verify focus returns to a sane element after `ReverseGeocodePopup` dismiss
  - **User Story**: Cross-cutting (supports US5)
  - **Priority**: N/A
  - **Files**: `src/features/search/components/ReverseGeocodePopup.tsx` (verification only)
  - **Acceptance Criteria**: Dismissing the popup (button or Escape) leaves focus on a visible, sensible element (e.g., the map container)
  - **Verification**:
    - [ ] `document.activeElement` is never `<body>` after dismiss
    - [ ] Works identically for both dismiss methods (button click and Escape)

- [X] T092 Verify Escape closes dropdown/popup without clearing query text
  - **User Story**: Cross-cutting (supports US1, US2, US5)
  - **Priority**: N/A
  - **Files**: `src/features/search/components/SearchBox.tsx` (verification only)
  - **Acceptance Criteria**: Escape closes the open surface but leaves any typed query text intact (FR-007)
  - **Verification**:
    - [ ] Typing "par", pressing Escape, then checking the input still shows "par"
    - [ ] Second Escape press (if dropdown already closed) does not clear the field either

- [ ] T093 Run automated accessibility audit (axe) against the search UI
  - **User Story**: Cross-cutting (validates SM-007)
  - **Priority**: N/A
  - **Files**: N/A (audit tooling, no source file changes unless violations found)
  - **Acceptance Criteria**: Zero critical/serious WCAG 2.2 AA violations reported
  - **Verification**:
    - [ ] Audit run with the search dropdown open
    - [ ] Audit run with `ReverseGeocodePopup` open
    - [ ] Any violation found is fixed and the audit re-run to confirm zero remain

---

## Phase I: Performance

**Purpose**: Verify and enforce the performance budget defined in `plan.md`.

- [X] T094 [P] Verify 300 ms debounce timing matches FR-003 exactly
  - **User Story**: Cross-cutting (supports US2)
  - **Priority**: N/A
  - **Files**: `src/features/search/components/SearchBox.tsx` (verification only)
  - **Acceptance Criteria**: Debounce delay measured at exactly 300 ms, not an approximation
  - **Verification**:
    - [ ] Network tab timing confirms one request per typing pause
    - [ ] No off-by-one timer bug (e.g., 250 ms or 350 ms drift)

- [X] T095 [P] Verify `React.memo` prevents unnecessary `SearchResultItem` re-renders
  - **User Story**: Cross-cutting (supports US2)
  - **Priority**: N/A
  - **Files**: `src/features/search/components/SearchResultItem.tsx` (verification only)
  - **Acceptance Criteria**: Changing `highlightedIndex` re-renders only the previously and newly highlighted rows
  - **Verification**:
    - [ ] React DevTools Profiler confirms limited re-render scope
    - [ ] No regression if the result list order changes

- [X] T096 [P] Memoize `highlightMatch` output per `(displayName, query)` pair
  - **User Story**: Cross-cutting (supports US2)
  - **Priority**: N/A
  - **Files**: `src/features/search/components/SearchResultItem.tsx`
  - **Acceptance Criteria**: Repeated renders with the same `(displayName, query)` pair do not recompute the highlighted segments
  - **Verification**:
    - [ ] Memoization key includes both `displayName` and `query`
    - [ ] No stale highlight shown when `query` changes

- [X] T097 [P] Verify React Query `staleTime` values reduce duplicate Nominatim calls
  - **User Story**: Cross-cutting (supports US1, US5)
  - **Priority**: N/A
  - **Files**: `src/features/search/hooks/useSearch.ts`, `src/features/search/hooks/useReverseGeocode.ts` (verification only)
  - **Acceptance Criteria**: Re-searching the same query within 30 s (or re-clicking the same point within 5 min) produces no new network request
  - **Verification**:
    - [ ] Network tab confirms cache hit (no request) on immediate re-query
    - [ ] Cache correctly expires and re-fetches after the stale window passes

- [X] T098 Run `ANALYZE=true npm run build` and confirm bundle budget (SM-008)
  - **User Story**: Cross-cutting (validates SM-008)
  - **Priority**: N/A
  - **Files**: N/A (build/analysis step)
  - **Acceptance Criteria**: Search feature adds ≤ 20 KB gzipped to the initial route bundle
  - **Verification**:
    - [ ] Bundle-analyzer report reviewed and attached/noted in the PR
    - [ ] If over budget, a follow-up task is filed rather than silently ignored

- [X] T099 Verify no `next/dynamic` wrapper is needed for the search feature
  - **User Story**: Cross-cutting (validates Constitution Principle VII)
  - **Priority**: N/A
  - **Files**: N/A (architectural verification)
  - **Acceptance Criteria**: Confirmed the feature's total added weight stays under the ~50 KB dynamic-import threshold
  - **Verification**:
    - [ ] Bundle-analyzer output referenced as evidence
    - [ ] Decision recorded as still valid post-implementation (matches `research.md`)

- [X] T100 [P] Add lazy-mount guard to `ReverseGeocodePopup.tsx`
  - **User Story**: Cross-cutting (supports US5)
  - **Priority**: N/A
  - **Files**: `src/features/search/components/ReverseGeocodePopup.tsx`
  - **Acceptance Criteria**: Component (and its `useReverseGeocode` call) only mounts when `reverseGeocodePoint` is non-null — no idle listener/DOM cost otherwise
  - **Verification**:
    - [ ] Component tree inspector shows the popup absent from the DOM when no point is set
    - [ ] No React Query call fires while unmounted

- [ ] T101 [P] Profile map-interaction cost during flyTo animation
  - **User Story**: Cross-cutting (supports US3)
  - **Priority**: N/A
  - **Files**: `src/features/search/hooks/useMapSearchIntegration.ts` (verification only)
  - **Acceptance Criteria**: No dropped frames (> 16 ms) attributable to search integration during a flyTo animation
  - **Verification**:
    - [ ] Browser performance profiler shows no long tasks introduced by this feature during flyTo
    - [ ] `useCoordinates` (Phase 1) continues to function normally during the animation

---

## Phase J: Testing

**Purpose**: Unit, hook, component, API, and integration test coverage per
Constitution Principle VIII (all three tiers required).

- [X] T102 [P] Write unit tests for `searchService.ts`
  - **User Story**: Cross-cutting (validates US1)
  - **Priority**: N/A
  - **Files**: `src/features/search/__tests__/searchService.test.ts`
  - **Acceptance Criteria**: Covers success response mapping and thrown `SearchApiError` on non-2xx, with `fetch` mocked
  - **Verification**:
    - [ ] Test resets mocks in `beforeEach`
    - [ ] Covers both a 200 and a 400/502 response case

- [X] T103 [P] Write unit tests for `reverseGeocodeService.ts`
  - **User Story**: Cross-cutting (validates US5)
  - **Priority**: N/A
  - **Files**: `src/features/search/__tests__/reverseGeocodeService.test.ts`
  - **Acceptance Criteria**: Covers a `result: null` success case distinctly from an error case
  - **Verification**:
    - [ ] `null` result does not throw
    - [ ] Error case preserves `code`/`message`

- [X] T104 [P] Write unit tests for `searchStore.ts` actions
  - **User Story**: Cross-cutting (validates US3, US4, US5)
  - **Priority**: N/A
  - **Files**: `src/features/search/__tests__/searchStore.test.ts`
  - **Acceptance Criteria**: Covers `selectLocation`/`setReverseGeocodePoint` mutual-exclusion invariant, `addRecentSearch` dedup + eviction, `clearRecentSearches`
  - **Verification**:
    - [ ] Store is reset between tests (no shared mutable state)
    - [ ] Eviction-at-11-entries case explicitly tested

- [X] T105 [P] Write unit tests for `nominatimProvider.ts` response mapping
  - **User Story**: Cross-cutting (validates US1, US5)
  - **Priority**: N/A
  - **Files**: `src/features/search/__tests__/nominatimProvider.test.ts`
  - **Acceptance Criteria**: Given fixture Nominatim JSON, mapping functions produce correctly-shaped `SearchResult[]`/`ReverseGeocodeResult`
  - **Verification**:
    - [ ] Fixture missing `boundingbox`/`address` sub-fields does not throw
    - [ ] No live network call made in this test (pure function testing only)

- [X] T106 [P] Write unit tests for `highlightMatch.ts` and `formatDistance.ts`
  - **User Story**: Cross-cutting (validates US1, US2)
  - **Priority**: N/A
  - **Files**: `src/features/search/__tests__/utils.test.ts`
  - **Acceptance Criteria**: Covers match/no-match/case-insensitivity for `highlightMatch`; empty-input case for `formatDistance`
  - **Verification**:
    - [ ] No snapshot-only tests — assertions check actual segment content
    - [ ] Edge case (empty query) explicitly covered

- [X] T107 [P] Write hook tests for `useSearch.ts`
  - **User Story**: Cross-cutting (validates US1, US2)
  - **Priority**: N/A
  - **Files**: `src/features/search/__tests__/useSearch.test.ts`
  - **Acceptance Criteria**: Verifies `enabled` gating at the 2-character boundary and correct query-key construction, with `searchService` mocked
  - **Verification**:
    - [ ] Test wraps the hook in a fresh `QueryClientProvider` per test
    - [ ] Retry-skip-on-4xx behavior explicitly tested

- [X] T108 [P] Write hook tests for `useReverseGeocode.ts`
  - **User Story**: Cross-cutting (validates US5)
  - **Priority**: N/A
  - **Files**: `src/features/search/__tests__/useReverseGeocode.test.ts`
  - **Acceptance Criteria**: Verifies `enabled` gating on `point !== null` and `null`-result handling
  - **Verification**:
    - [ ] `data === null` vs `data === undefined` distinction explicitly asserted
    - [ ] Fresh `QueryClient` per test

- [X] T109 [P] Write hook tests for `useSearchHistory.ts`
  - **User Story**: Cross-cutting (validates US4)
  - **Priority**: N/A
  - **Files**: `src/features/search/__tests__/useSearchHistory.test.ts`
  - **Acceptance Criteria**: Verifies add/clear/reorder behavior via the hook's public API
  - **Verification**:
    - [ ] Store reset before each test
    - [ ] No React Query involvement in this test (pure Zustand)

- [X] T110 [P] Write component tests for `SearchBox.tsx`
  - **User Story**: Cross-cutting (validates US1, US2)
  - **Priority**: N/A
  - **Files**: `src/features/search/__tests__/SearchBox.test.tsx`
  - **Acceptance Criteria**: Covers debounce behavior, minimum-length gating, and keyboard navigation including wrap-around
  - **Verification**:
    - [ ] Uses fake timers for debounce assertions
    - [ ] Wrap-around explicitly asserted (last→first, first→last)

- [X] T111 [P] Write component tests for `SearchResults.tsx`
  - **User Story**: Cross-cutting (validates US1, US2)
  - **Priority**: N/A
  - **Files**: `src/features/search/__tests__/SearchResults.test.tsx`
  - **Acceptance Criteria**: Covers all four render variants (loading/error/empty/list) with `useSearch` mocked per variant
  - **Verification**:
    - [ ] Each variant tested in isolation
    - [ ] `aria-live` region content asserted for at least one transition

- [X] T112 [P] Write component tests for `SearchResultItem.tsx`
  - **User Story**: Cross-cutting (validates US1, US2)
  - **Priority**: N/A
  - **Files**: `src/features/search/__tests__/SearchResultItem.test.tsx`
  - **Acceptance Criteria**: Covers click selection, Enter-key selection, and `highlightMatch` rendering
  - **Verification**:
    - [ ] `onSelect` called with the correct `result` object
    - [ ] No unhandled console warnings

- [X] T113 [P] Write component tests for `SearchHistory.tsx`
  - **User Story**: Cross-cutting (validates US4)
  - **Priority**: N/A
  - **Files**: `src/features/search/__tests__/SearchHistory.test.tsx`
  - **Acceptance Criteria**: Covers empty (renders null), populated, and post-clear states
  - **Verification**:
    - [ ] Empty state asserted to render no DOM output
    - [ ] Clear action asserted to empty the list

- [X] T114 [P] Write component tests for `SearchErrorState.tsx` and `SearchEmptyState.tsx`
  - **User Story**: Cross-cutting (validates US1)
  - **Priority**: N/A
  - **Files**: `src/features/search/__tests__/states.test.tsx`
  - **Acceptance Criteria**: Covers Retry click behavior and both `SearchEmptyState` variants
  - **Verification**:
    - [ ] Retry handler invoked exactly once per click
    - [ ] Both empty-state variants render distinct copy

- [X] T115 [P] Write API route tests for `app/api/search/route.ts`
  - **User Story**: Cross-cutting (validates US1)
  - **Priority**: N/A
  - **Files**: `src/features/search/__tests__/searchRoute.test.ts`
  - **Acceptance Criteria**: Covers valid request (200), invalid query (400), rate-limited (429), and provider failure (502) — provider mocked, no live HTTP call
  - **Verification**:
    - [ ] All four cases asserted against `contracts/api-contracts.md`'s exact shape
    - [ ] No real network call reaches Nominatim in this test

- [X] T116 [P] Write API route tests for `app/api/reverse-geocode/route.ts`
  - **User Story**: Cross-cutting (validates US5)
  - **Priority**: N/A
  - **Files**: `src/features/search/__tests__/reverseGeocodeRoute.test.ts`
  - **Acceptance Criteria**: Covers valid request (200 with a result), valid-but-no-match (200 with `result: null`), invalid coordinates (400), rate-limited (429), provider failure (502)
  - **Verification**:
    - [ ] `result: null` case explicitly distinguished from the error cases
    - [ ] No real network call reaches Nominatim in this test

- [X] T117 Write integration test for the Search → Map flow
  - **User Story**: Cross-cutting (validates US1, US2, US3, US4)
  - **Priority**: N/A
  - **Files**: `src/features/search/__tests__/searchToMap.integration.test.tsx`
  - **Acceptance Criteria**: Type → debounced suggestions → select → flyTo/marker placement/recent-search persisted, with network mocked at the boundary (e.g., MSW)
  - **Verification**:
    - [ ] Leaflet's `flyTo` call asserted with correct arguments (coords, zoom 16)
    - [ ] Recent search appears in `searchStore` after selection

- [X] T118 Write integration test for the Reverse Geocoding flow
  - **User Story**: Cross-cutting (validates US5)
  - **Priority**: N/A
  - **Files**: `src/features/search/__tests__/reverseGeocode.integration.test.tsx`
  - **Acceptance Criteria**: Map click → popup opens → loading → address (or empty state) → dismiss, fully mocked network
  - **Verification**:
    - [ ] Both the address-found and no-address-found paths are covered
    - [ ] Popup removal from the DOM confirmed after dismiss

- [X] T119 Write integration test for the Recent Searches flow
  - **User Story**: Cross-cutting (validates US4)
  - **Priority**: N/A
  - **Files**: `src/features/search/__tests__/recentSearches.integration.test.tsx`
  - **Acceptance Criteria**: Select → clear query → history shown → re-select → dedup verified → clear history → empty state
  - **Verification**:
    - [ ] Persistence to `localStorage` verified (mocked storage, assert `setItem` called with expected payload)
    - [ ] Full round trip covered in a single, readable test flow

---

## Phase K: Documentation

**Purpose**: Feature README, API docs, deployment notes, environment variables,
and provider-extension guide (Constitution Principle X).

- [X] T120 [P] Write `src/features/search/README.md`
  - **User Story**: Cross-cutting
  - **Priority**: N/A
  - **Files**: `src/features/search/README.md`
  - **Acceptance Criteria**: Documents purpose, public API (`SearchBox`, `ReverseGeocodePopup`), a usage example, and known limitations (per Constitution Principle X)
  - **Verification**:
    - [ ] Usage example compiles conceptually against the actual exported API
    - [ ] Known limitations section mentions the single-instance rate-limiter caveat

- [X] T121 [P] Write `docs/api/search.md`
  - **User Story**: Cross-cutting
  - **Priority**: N/A
  - **Files**: `docs/api/search.md`
  - **Acceptance Criteria**: Documents both endpoints' request/response contracts for external consumers, consistent with `contracts/api-contracts.md`
  - **Verification**:
    - [ ] No drift from `contracts/api-contracts.md` (same error codes, same shapes)
    - [ ] Includes example `curl` commands for both endpoints

- [X] T122 [P] Update `docs/deployment.md`
  - **User Story**: Cross-cutting
  - **Priority**: N/A
  - **Files**: `docs/deployment.md`
  - **Acceptance Criteria**: Adds the Nominatim outbound-network requirement and rate-limit note for production deployments
  - **Verification**:
    - [ ] Existing Phase 1 deployment content is preserved, not overwritten
    - [ ] New section is clearly delineated (e.g., under a "Phase 2: Search" heading)

- [X] T123 [P] Write `docs/environment-variables.md`
  - **User Story**: Cross-cutting
  - **Priority**: N/A
  - **Files**: `docs/environment-variables.md`
  - **Acceptance Criteria**: Documents `NOMINATIM_BASE_URL`, `SEARCH_USER_AGENT`, `SEARCH_RATE_LIMIT_PER_SECOND` with defaults and descriptions
  - **Verification**:
    - [ ] Matches `.env.example` (T008) exactly — no undocumented or missing variables
    - [ ] Each variable's default value is stated explicitly

- [X] T124 [P] Write `docs/geocoding-providers.md`
  - **User Story**: Cross-cutting
  - **Priority**: N/A
  - **Files**: `docs/geocoding-providers.md`
  - **Acceptance Criteria**: Documents the `GeocodingProvider` interface and the steps to add a future provider (ArcGIS/Google Places/Mapbox), per `plan.md`'s Future Extensibility section
  - **Verification**:
    - [ ] Steps reference the actual factory file (`getGeocodingProvider.ts`) by name
    - [ ] No implementation code included — guidance only

- [X] T125 Run final quality gate: `npx tsc --noEmit` and `npx eslint src --max-warnings 0`
  - **User Story**: Cross-cutting (validates Constitution Principle XVII)
  - **Priority**: N/A
  - **Files**: N/A (whole-project check)
  - **Acceptance Criteria**: Zero TypeScript errors, zero ESLint warnings/errors across the entire codebase including all new search feature files
  - **Verification**:
    - [ ] Command exit code 0 for both checks
    - [ ] No `@ts-ignore`/`@ts-expect-error`/`any` introduced anywhere in this feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase A (T001–T017)**: No dependencies — start immediately. Internal order:
  T001 first; T002–T006/T008 in parallel; T007/T009–T017 sequential after their
  respective prerequisites (schemas before validation, provider before factory).
- **Phase B (T018–T029)**: Requires Phase A complete (provider, schemas, validation,
  limiter all exist).
- **Phase C (T030–T038)**: Requires Phase B complete (both Route Handlers functional).
- **Phase D (T039–T048)**: Can start in parallel with Phase C (independent of Route
  Handlers) — only requires Phase A's types.
- **Phase E (T049–T068)**: Requires Phase C (hooks) and Phase D (store) complete.
- **Phase F (T069–T078)**: Requires Phase D (store) and Phase E (components) complete.
- **Phase G (T079–T085)**: Requires Phase D, E, and F complete (full selection flow
  must exist to verify end-to-end).
- **Phase H (T086–T093)**: Requires Phase E and F complete (components and map
  integration must exist to audit).
- **Phase I (T094–T101)**: Requires Phase E and F complete.
- **Phase J (T102–T119)**: Requires the corresponding implementation phase(s)
  complete for whatever it tests (e.g., T115/T116 require Phase B; T117 requires
  Phases D–F).
- **Phase K (T120–T125)**: Requires all prior phases complete.

### Mapping to User Stories (Independent-Test View)

Although organized by technical milestone, each user story remains independently
verifiable once its constituent tasks across phases are done:

- **US1 (Place Search)**: T001–T002, T005–T022, T028, T030–T031, T033, T035,
  T037, T049–T059, T061–T066, T078 — independently testable via `quickstart.md`
  Section 3 (steps 1–5).
- **US2 (Search Suggestions)**: T042, T052, T064, T086–T087, T094–T096 (layered on
  top of US1) — testable via `quickstart.md` Section 3 (steps 3–6, wrap-around).
- **US3 (Map Navigation)**: T043, T063, T069–T073, T090, T101 — testable via
  `quickstart.md` Section 3 (step 7).
- **US4 (Recent Searches)**: T003, T045–T048, T060, T079–T085, T109, T113, T119 —
  testable via `quickstart.md` Section 4.
- **US5 (Reverse Geocoding)**: T004, T009–T010, T014–T015, T019 (analog),
  T023–T027, T029, T032, T034, T036, T038, T044, T067–T068, T074–T077, T088–T089,
  T100, T108, T116, T118 — testable via `quickstart.md` Section 5.

### Parallel Opportunities

```
Phase A: T001,T002,T003,T004,T005,T006,T008 ──┐
                                                ├──→ T007,T009,T010,T011 ──→ T012,T013,T014,T015 ──→ T016,T017
Phase B: (after Phase A) T018 → T019 → T020 → T021 → T022 ──┐
                          T023 → T024 → T025 → T026 → T027 ──┤──→ T028,T029 [P]
Phase C: (after Phase B) T030 ──→ T031,T032 [P] ──→ T033,T034 ──→ T035,T036 ──→ T037,T038 [P]
Phase D: (parallel with C, after Phase A) T039 → T040,T041,T042 [P] → T043,T044 → T045,T046,T047 → T048
Phase E: (after C+D) T049 [P] → T050 → T051 → T052,T053 → T054,T055,T056 [P] → T057,T058 → T059 → T060,T061 → T062,T063,T064 [P] → T065,T066 → T067,T068
Phase F: (after D+E) T069 → T070,T071 → T072,T073 → T074 → T075 → T076,T077 → T078
Phase G: (after D+E+F) T079,T080,T081,T082,T083,T084,T085 [mostly P]
Phase H/I: (after E+F) all tasks marked [P] can run in parallel
Phase J: (after respective phases) all tasks marked [P] can run in parallel; T117–T119 sequential last
Phase K: (after everything) T120,T121,T122,T123,T124 [P] → T125
```

---

## Implementation Strategy

### MVP First

1. Phase A: Search Foundation (T001–T017) — **CRITICAL, do not skip**
2. Phase B: Route Handlers (T018–T029)
3. Phase C: React Query (T030–T038) + Phase D: Zustand (T039–T048) in parallel
4. Phase E: UI (T049–T068) → Phase F: Map Integration (T069–T078)
5. **STOP and validate**: run `quickstart.md` Sections 2–3 (US1 + US2 + US3) —
   this is the MVP slice (place search working end-to-end with map navigation)
6. Run `npx tsc --noEmit` — must be zero errors before continuing

### Incremental Delivery

1. Phase A + B → backend/API ready, verifiable via `curl` (`quickstart.md` Section 2)
2. Phase C + D → data layer ready (no visible UI yet)
3. Phase E + F → **US1 + US2 + US3 working** (MVP) — validate via `quickstart.md`
   Section 3
4. Phase G → **US4 working** — validate via `quickstart.md` Section 4
5. Phase F's reverse-geocode tasks + Phase G analogs → **US5 working** — validate
   via `quickstart.md` Section 5
6. Phase H (Accessibility) + Phase I (Performance) → quality hardening
7. Phase J (Testing) → coverage across all tiers
8. Phase K (Documentation) → final polish and sign-off

### Key Implementation Notes

- Never call `nominatimProvider.ts` from anywhere except `getGeocodingProvider.ts`
  and the two Route Handlers — this is the Constitution Principle V boundary.
- `searchStore.selectedLocation` and `reverseGeocodePoint` are mutually exclusive by
  construction (T043/T044) — do not add a third code path that sets both.
- `useDebounce` lives in `shared/hooks/`, not `features/search/hooks/` — see
  `research.md` Decision 2 before creating any new debounce logic.
- After each phase: run `npx tsc --noEmit` before moving to the next.
- Commit after each phase checkpoint (A through K), consistent with Phase 1's
  per-user-story commit cadence.
