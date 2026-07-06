# Feature Specification: Intelligent Search & Geospatial Intelligence

**Feature Branch**: `002-search`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "Phase 2 – Intelligent Search & Geospatial Intelligence: place search, search suggestions, map navigation, recent searches, and reverse geocoding, built on top of the completed Phase 1 application foundation (dashboard layout, responsive sidebar, Leaflet map, Zustand stores, React Query, theme support, accessibility foundation, testing infrastructure)."

---

# Overview

Phase 1 delivered a working map shell but gave users no way to find a place without
already knowing its coordinates or panning/zooming manually. This phase adds an
intelligent search experience: a user types a place name, sees ranked suggestions as
they type, selects one, and the map flies to that location with a marker dropped. The
system also remembers recent searches for one-click recall, and lets a user click
anywhere on the map to discover the address at that point (reverse geocoding).

**Business goal**: reduce time-to-location from "know the coordinates" to "know the
name," making the platform usable by non-GIS-specialist staff who think in place names,
not lat/lng pairs.

**User value**: users can find any place in seconds via a familiar search-box
interaction, return to places they searched recently without retyping, and identify
"what is at this point on the map" without leaving the map view.

---

## Clarifications

### Session 2026-07-06

- Q: Which geocoding provider should power place search and reverse geocoding? → A: Nominatim (OpenStreetMap) — free, keyless, consistent with the existing OSM/Esri tile usage from Phase 1.
- Q: What zoom level should the map use after flying to a selected search result? → A: A fixed zoom level (16) for every result, regardless of result type (point or area).
- Q: Should keyboard focus wrap around at the top/bottom of the search results list? → A: Yes — Down from the last item wraps to the first, and Up from the first wraps to the last, matching the ARIA APG combobox pattern.

---

# Goals

- Provide a single, discoverable search entry point in the dashboard shell that
  returns ranked place suggestions as the user types.
- Let a user select a suggestion and have the map navigate to it smoothly, with a
  marker placed at the result location.
- Persist a short history of recent searches locally so a user can re-select a past
  search without retyping it.
- Let a user click any point on the map to retrieve a human-readable address for that
  point (reverse geocoding).
- Keep the search feature fully keyboard-accessible, screen-reader friendly, and
  usable at mobile viewport widths, per the project constitution.
- Keep all external geocoding calls server-side, behind a Route Handler
  backend-for-frontend (BFF) layer, per the project constitution.

---

# Out of Scope

The following are explicitly **not** part of this phase:

- Turn-by-turn routing or directions between two searched locations.
- Saved/bookmarked/"favorite" locations that persist beyond the recent-searches list.
- Support for multiple, user-selectable geocoding providers or provider fallback/failover.
- Search filters such as category, radius, bounding-box restriction, or result sorting
  controls exposed in the UI.
- Bulk/batch geocoding of an uploaded list of addresses.
- Voice-driven search input.
- An offline or locally-cached search index that works without network connectivity.
- Search analytics, usage dashboards, or telemetry beyond what Principle XV
  (Logging Strategy) already requires for Route Handlers.
- Editing, renaming, or organizing recent search entries (e.g., pinning, folders).

---

# User Stories

### US1 - Place Search (Priority: P1) 🎯 MVP

**Description**: As a user, I want to type the name of a place into a search box so
that I can find it on the map without knowing its coordinates.

**Acceptance Criteria**:

1. **Given** the dashboard is loaded, **When** the user focuses the search input and
   types a place name of at least the minimum query length, **Then** the system
   queries for matching places and displays a list of results.
2. **Given** search results are displayed, **When** the user selects one, **Then** the
   selected place becomes the active search result (feeding US3 map navigation).
3. **Given** the user has typed fewer characters than the minimum query length,
   **When** they pause typing, **Then** no search request is made and no result list
   is shown.
4. **Given** a search request is in flight, **When** the user submits a new query
   before the previous one resolves, **Then** only the result of the latest query is
   shown to the user.

**Success Criteria**:

- A user can locate a named place they know exists, without prior knowledge of its
  coordinates, in under 10 seconds from opening the search box.
- At least 95% of searches for real, findable place names return at least one result.

---

### US2 - Search Suggestions (Priority: P2)

**Description**: As a user, I want to see live suggestions while I type so that I can
find the right place faster and correct typos without submitting a full search.

**Acceptance Criteria**:

1. **Given** the user is typing in the search input, **When** they pause for the
   debounce interval, **Then** an updated suggestion list is fetched and displayed
   without requiring an explicit "Search" submit action.
2. **Given** a suggestion list is showing, **When** the user continues typing,
   **Then** the previous suggestion list remains visible until the new one is ready
   (no flash of empty state during retyping).
3. **Given** suggestions are displayed, **When** the user presses the Down/Up arrow
   keys, **Then** focus moves between suggestions without leaving the input field
   (US covers keyboard navigation, detailed further in Functional Requirements).
4. **Given** no suggestions match the current query, **When** the request resolves,
   **Then** an explicit "no results" empty state is shown instead of a blank list.

**Success Criteria**:

- Suggestions appear within a perceived delay of 500 ms or less after the user stops
  typing, on a standard broadband connection.
- Users successfully select a suggestion (rather than abandoning the search) in at
  least 80% of search sessions during usability validation.

---

### US3 - Map Navigation (Priority: P3)

**Description**: As a user, I want the map to smoothly navigate to my selected search
result and mark its location so that I can immediately see where the place is.

**Acceptance Criteria**:

1. **Given** the user selects a search result, **When** the selection is confirmed,
   **Then** the map animates (flies) from its current view to center on the selected
   location at a fixed zoom level of 16, regardless of the result's type.
2. **Given** the map has navigated to a selected result, **When** the animation
   completes, **Then** a marker is placed at the result's coordinates.
3. **Given** a marker is already placed from a previous selection, **When** a new
   result is selected, **Then** the previous marker is replaced (only one active
   search marker at a time).
4. **Given** the map is mid-flight to a location, **When** the user manually
   interacts with the map (drag/zoom), **Then** the flight animation is cancelled
   gracefully without leaving the map in an inconsistent state.

**Success Criteria**:

- The map completes its navigation animation to any selected result within 2 seconds.
- The status bar coordinate/zoom readout (delivered in Phase 1) correctly reflects the
  map's new center and zoom immediately after navigation completes.

---

### US4 - Recent Searches (Priority: P4)

**Description**: As a user, I want my recent searches remembered so that I can quickly
return to a place I looked up before without retyping it.

**Acceptance Criteria**:

1. **Given** a user selects a search result, **When** the selection is confirmed,
   **Then** that result is added to the top of a recent-searches list.
2. **Given** the recent-searches list has reached its maximum size, **When** a new
   search is added, **Then** the oldest entry is removed to make room.
3. **Given** the user reopens the search box with an empty query, **When** no query
   has been typed yet, **Then** the recent-searches list is shown in place of live
   suggestions.
4. **Given** the user selects an entry from recent searches, **When** selected,
   **Then** the same map-navigation behavior as US3 is triggered, and the entry moves
   to the top of the list (most-recently-used ordering, not duplicated).
5. **Given** the user reloads the application, **When** the dashboard loads,
   **Then** the recent-searches list persists across the reload.

**Success Criteria**:

- Recent searches persist across a full page reload and remain available for at least
  the current browser session/profile without requiring a server account.
- A user can re-navigate to a previously searched place in one click from an empty
  search box.

---

### US5 - Reverse Geocoding (Priority: P5)

**Description**: As a user, I want to click a point on the map and see the address at
that location so that I can identify unlabeled places without searching by name.

**Acceptance Criteria**:

1. **Given** the map is in reverse-geocode mode (or the designated interaction for
   triggering it), **When** the user clicks a point on the map, **Then** the system
   requests and displays the address (or best-available place description) for that
   point's coordinates.
2. **Given** a reverse-geocode request is in flight, **When** the user is waiting,
   **Then** a loading indicator is shown at or near the clicked point.
3. **Given** no address can be determined for the clicked point (e.g., open ocean),
   **When** the request resolves, **Then** an explicit "no address found" state is
   shown rather than an error or blank result.
4. **Given** a reverse-geocode result is displayed, **When** the user dismisses it,
   **Then** the associated marker/popup is removed and the map returns to its normal
   interaction mode.

**Success Criteria**:

- A user can retrieve an address for any clicked point on land in under 2 seconds
  under normal network conditions.
- The reverse-geocode result is presented without requiring the user to leave the map
  view (no full-page navigation or modal that obscures the clicked location).

---

## Edge Cases

- User submits a query consisting only of whitespace → treated as empty; no request
  is made.
- User types faster than the debounce interval repeatedly → only the final query
  after typing pauses triggers a request; in-flight stale requests are discarded/
  ignored when their response arrives after a newer request's response.
- Search request fails due to network/provider error → error state per Functional
  Requirements is shown with a retry action; recent searches and prior map state are
  left untouched.
- User presses Enter with no suggestion highlighted → the top suggestion (if any) is
  selected; if there are no suggestions, no action is taken.
- User selects a recent search whose place no longer resolves via the provider (e.g.
  transient outage) → map still navigates using the recent entry's stored
  coordinates; no new geocode call is required for navigation.
- Reverse-geocode click occurs while a search flyTo animation is in progress → the
  click is ignored until the animation settles, to avoid ambiguous coordinates.
- Local storage for recent searches is full, disabled, or unavailable (private
  browsing) → the feature degrades to in-memory-only history for the current session
  without throwing an error.
- User clears the search input after selecting a result → the placed marker and map
  position remain until a new search, reverse-geocode action, or explicit clear
  control removes them.

---

# Functional Requirements

**Search Input**

- **FR-001**: The system MUST provide a single, persistently accessible search input
  in the dashboard shell for entering a place-name query.
- **FR-002**: The system MUST treat a query consisting only of whitespace as an empty
  query and MUST NOT issue a search request for it.

**Debouncing**

- **FR-003**: The system MUST debounce search-suggestion requests by 300 ms of
  typing inactivity before issuing a request to the search API.
- **FR-004**: The system MUST discard or ignore the response of a stale search
  request if a newer request for the same input has already been issued.

**Minimum Query Length**

- **FR-005**: The system MUST require a minimum of 2 characters (after trimming
  whitespace) before issuing a suggestion request; queries shorter than this MUST
  show the recent-searches list (if non-empty) instead of triggering a network call.

**Keyboard Navigation**

- **FR-006**: The system MUST allow Up/Down arrow keys to move highlighted focus
  between visible search results without moving the browser's text-input caret focus
  away from the search field. Focus MUST wrap around at the list boundaries: pressing
  Down on the last result moves highlight to the first result, and pressing Up on the
  first result moves highlight to the last result.
- **FR-007**: The system MUST allow Enter to select the currently highlighted result,
  and Escape to close the results list/reverse-geocode popup without clearing the
  typed query.
- **FR-008**: All search result items MUST be reachable and selectable using only the
  keyboard, with a visible focus indicator per Constitution Principle VI.

**Loading State**

- **FR-009**: The system MUST display a distinct loading indicator while a search or
  reverse-geocode request is in flight, visually distinguishable from both the empty
  and error states.
- **FR-010**: The loading indicator MUST NOT block keyboard input into the search
  field while a request is in flight.

**Error State**

- **FR-011**: The system MUST display an explicit, user-facing error state when a
  search or reverse-geocode request fails, including a retry action, per Constitution
  Principle XIV.
- **FR-012**: The system MUST NOT leave the user with a silent blank result area on
  failure; an error state or message MUST always be shown.

**Empty State**

- **FR-013**: The system MUST display an explicit "no results found" message when a
  search query returns zero matches, distinct from the loading and error states.
- **FR-014**: The system MUST display an explicit empty state (e.g., "Start typing to
  search" or the recent-searches list) when the search input has no query and no
  recent searches exist.

**Search Result Selection**

- **FR-015**: The system MUST allow a user to select exactly one search result at a
  time via mouse click, tap, or keyboard (Enter).
- **FR-016**: Selecting a search result MUST trigger map navigation (US3) and add the
  result to recent searches (US4).

**Marker Placement**

- **FR-017**: The system MUST place a single marker at the coordinates of the most
  recently selected search result or reverse-geocode point.
- **FR-018**: The system MUST remove or replace the previous search/reverse-geocode
  marker when a new one is placed, so at most one such marker is shown at a time.

**Map flyTo()**

- **FR-019**: The system MUST animate the map's transition to a selected result's
  coordinates rather than snapping instantly, navigating to a fixed zoom level of 16
  regardless of the result's type (point or area).
- **FR-020**: The system MUST gracefully interrupt an in-progress map-navigation
  animation if the user manually interacts with the map before it completes.

**Recent Searches**

- **FR-021**: The system MUST persist a list of recent searches across page reloads
  within the same browser, capped at a fixed maximum (10 entries).
- **FR-022**: The system MUST move a re-selected recent search to the top of the list
  rather than creating a duplicate entry.
- **FR-023**: The system MUST allow a user to clear their recent-searches history.

**Reverse Geocoding**

- **FR-024**: The system MUST allow a user to trigger a reverse-geocode lookup for a
  point on the map and display the resulting address or place description.
- **FR-025**: The system MUST display an explicit "no address found" state when
  reverse geocoding a point yields no result (e.g., open water).

**Status Bar Updates**

- **FR-026**: The system MUST update the existing status bar's coordinate and zoom
  readout to reflect the map's new center and zoom immediately after a search-driven
  or reverse-geocode-driven map navigation completes.

---

# Non-functional Requirements

**Accessibility**

- The feature MUST conform to **WCAG 2.2 AA**, per Constitution Principle VI: visible
  keyboard focus indicators on all search/result/marker controls, ARIA labels on the
  search input and result list (e.g., `role="combobox"`/`role="listbox"` semantics),
  and `aria-live="polite"` announcements for loading, error, empty, and result-count
  states so screen-reader users are informed without focus being stolen.

**Performance**

- Search-suggestion requests MUST be debounced at 300 ms (FR-003) to avoid excessive
  network traffic and upstream provider load.
- The perceived latency from "user stops typing" to "suggestions rendered" SHOULD NOT
  exceed 500 ms under normal broadband conditions.
- Map flyTo animations MUST complete within 2 seconds regardless of the distance
  travelled.

**Bundle Size**

- Any client-side mapping or search-UI dependency added for this feature MUST be
  evaluated against the project's bundle budget per Constitution Principle VII; new
  dependencies over 20 KB gzipped MUST be reviewed via bundle-analyzer before merge.
- The search feature's UI MUST NOT be part of the initial route bundle if it can be
  deferred without harming the primary search interaction's responsiveness.

**Mobile Responsiveness**

- The search input and result list MUST remain fully usable at viewport widths down
  to 320 px, per Constitution Principle XVI, including on-screen keyboard overlap
  handling so the result list remains visible while typing on a touch device.
- All interactive result/marker controls MUST meet the 44×44 px minimum touch-target
  size on touch-capable viewports.

**Security**

- All calls to the external geocoding/search provider MUST be issued from a Route
  Handler (BFF), never directly from the browser, per Constitution Principle V.
- All query parameters received by a Route Handler MUST be validated (type, length,
  numeric range for coordinates) before being forwarded upstream, per Constitution
  Principle IX.
- No provider API key or credential MUST be exposed in client-side code or a
  `NEXT_PUBLIC_*` environment variable.
- Requests to Nominatim MUST include a custom, application-identifying `User-Agent`
  header set server-side within the Route Handler, per Nominatim's usage policy.

**Reliability**

- A failure of the external geocoding provider MUST degrade to a visible error state
  (FR-011) rather than an unhandled exception or blank UI.
- Recent-searches data MUST remain intact and unaffected by a transient search or
  reverse-geocode failure.
- The Route Handlers MUST stay within Nominatim's usage-policy limit of approximately
  1 request per second to the upstream provider (e.g., via request queuing or short
  server-side response caching), and MUST surface a `RATE_LIMITED` error to the
  client rather than silently dropping requests if that limit is reached.

**Error Handling**

- All error states MUST follow Constitution Principle XIV: typed error responses from
  Route Handlers, feature-level error boundaries, and a user-facing recovery action
  (retry) wherever recovery is possible.

---

# API Requirements

Both endpoints act as the mandatory backend-for-frontend layer (Constitution
Principle V) between the client and the external geocoding provider; the client MUST
NOT call the upstream provider directly.

### `GET /api/search`

Returns ranked place-search results for a free-text query.

**Request Parameters** (query string):

| Parameter | Type | Required | Constraints |
|---|---|---|---|
| `q` | string | Yes | Trimmed length MUST be ≥ 2 characters |
| `limit` | number | No | Default 8; MUST be clamped to a maximum of 10 |

**Success Response** (`200 OK`):

```
{
  "results": SearchResult[]
}
```

**Error Response** (`4xx`/`5xx`):

```
{
  "error": {
    "code": string,
    "message": string
  }
}
```

Error codes MUST include at minimum: `INVALID_QUERY` (400, query missing or below
minimum length), `PROVIDER_UNAVAILABLE` (502, upstream provider error/timeout), and
`RATE_LIMITED` (429, upstream or local rate limit exceeded).

### `GET /api/reverse-geocode`

Returns the best-available address/place description for a coordinate pair.

**Request Parameters** (query string):

| Parameter | Type | Required | Constraints |
|---|---|---|---|
| `lat` | number | Yes | MUST be within `-90..90` |
| `lng` | number | Yes | MUST be within `-180..180` |

**Success Response** (`200 OK`):

```
{
  "result": ReverseGeocodeResult | null
}
```

`result` MUST be `null` (not an error) when the coordinates are valid but no address
can be determined (e.g., open ocean) — this is the API-level counterpart of FR-025.

**Error Response** (`4xx`/`5xx`):

```
{
  "error": {
    "code": string,
    "message": string
  }
}
```

Error codes MUST include at minimum: `INVALID_COORDINATES` (400, out-of-range or
missing lat/lng), `PROVIDER_UNAVAILABLE` (502), and `RATE_LIMITED` (429).

---

# Data Model

```typescript
interface SearchResult {
  /** Stable identifier for the result, as provided by the geocoding provider */
  id: string;
  /** Human-readable label shown in the results list */
  displayName: string;
  /** Latitude in decimal degrees */
  lat: number;
  /** Longitude in decimal degrees */
  lng: number;
  /** Optional bounding box [south, west, north, east] for area-type results;
   *  informational only — navigation always uses the fixed zoom level (FR-019),
   *  not this bounding box */
  boundingBox?: [number, number, number, number];
  /** Optional place category/type (e.g., "city", "restaurant", "landmark") */
  category?: string;
  /** Optional provider-supplied relevance score, higher is more relevant */
  importance?: number;
}

interface RecentSearch {
  /** Unique identifier for this recent-search entry */
  id: string;
  /** The original query text the user typed */
  query: string;
  /** The search result the user selected for this entry */
  result: SearchResult;
  /** ISO 8601 timestamp of when this entry was last selected/re-selected */
  searchedAt: string;
}

interface ReverseGeocodeResult {
  /** Human-readable label for the resolved location */
  displayName: string;
  /** Latitude in decimal degrees (echoes or resolves the queried point) */
  lat: number;
  /** Longitude in decimal degrees (echoes or resolves the queried point) */
  lng: number;
  /** Structured address components, when available from the provider */
  address?: {
    road?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}
```

---

# Constraints

- **Feature-based architecture (Constitution Principle I)**: All search functionality
  MUST live under `src/features/search/`, owning its own components, hooks, services,
  store, types, and tests, exposed only via a public barrel.
- **Strict TypeScript (Constitution Principle II)**: `SearchResult`, `RecentSearch`,
  and `ReverseGeocodeResult` MUST be defined as explicit, `any`-free types shared
  between the client and the Route Handlers.
- **State management (Constitution Principle IV)**:
  - **TanStack React Query** MUST be used for all server state: live search results
    and reverse-geocode responses fetched from the Route Handlers.
  - **Zustand** MUST be used for client/UI state: current query text, selected
    result, active marker, recent-searches list, and search-panel open/closed state.
  - React Query's cache MUST NOT be duplicated into a Zustand store.
- **Route Handlers for external APIs (Constitution Principle V)**: `GET /api/search`
  and `GET /api/reverse-geocode` MUST be the only code paths that call the external
  geocoding provider; no client component or hook may call it directly.
- **Feature-based architecture applies to API code too**: Route Handlers for this
  feature MUST be grouped under `app/api/search/` and `app/api/reverse-geocode/`,
  mirroring the `search` feature they serve, per Constitution Principle XII.

---

# Success Metrics

- **SM-001**: At least 95% of searches for real, findable place names return one or
  more relevant results.
- **SM-002**: Suggestions render within a perceived 500 ms of the user pausing typing,
  under normal broadband conditions.
- **SM-003**: Map navigation to a selected result completes within 2 seconds in at
  least 95% of selections.
- **SM-004**: At least 80% of users who open the search box and type a valid query
  successfully select a result (rather than abandoning the search) during usability
  validation.
- **SM-005**: Recent searches remain available and correctly ordered after a full
  page reload in 100% of manual verification passes.
- **SM-006**: Reverse-geocode results are returned within 2 seconds for at least 95%
  of clicks on land-based coordinates.
- **SM-007**: The feature introduces zero critical or serious WCAG 2.2 AA violations
  in an automated accessibility audit of the search UI.
- **SM-008**: The feature adds no more than 20 KB gzipped to the initial route bundle,
  verified via bundle-analyzer before merge.

---

# Assumptions

- **Geocoding provider**: Resolved via Clarifications — the system uses **Nominatim**
  (OpenStreetMap's geocoding service) for both place search and reverse geocoding,
  consistent with the OSM/Esri map tiles already used in Phase 1. All requests to it
  MUST be issued only from the Route Handlers (never the browser), since Nominatim's
  usage policy requires a custom, application-identifying `User-Agent` header and
  limits usage to approximately 1 request per second (see Non-functional Requirements
  > Security and Reliability). A different or paid provider can be substituted later
  without changing this specification, since all provider calls are already isolated
  behind the BFF layer.
- **Recent-search persistence**: Recent searches are assumed to persist via the
  browser's local storage (consistent with the existing theme and sidebar-preference
  persistence pattern from Phase 1), not a server-side account — no user
  authentication exists yet in this project.
- **Result list size**: The search API is assumed to return a default of 8 results per
  query (configurable up to a maximum of 10), balancing usefulness against list
  scannability on small viewports.
- **Reverse-geocode trigger**: Reverse geocoding is assumed to be triggered by a
  direct map click (rather than a separate mode toggle), since no other click-based
  map interaction exists yet in this project phase.
- **Single active marker**: Only one search/reverse-geocode marker is assumed to be
  meaningful at a time in this phase; multi-marker comparison is out of scope
  (see Out of Scope).
