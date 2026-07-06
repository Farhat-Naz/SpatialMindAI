# Data Model: Intelligent Search & Geospatial Intelligence

**Feature**: 002-search
**Date**: 2026-07-07

This feature introduces no database. All entities are either ephemeral (React Query
cache), in-memory Zustand state, or persisted to `localStorage`. Full TypeScript
interface definitions for `SearchResult`, `RecentSearch`, and `ReverseGeocodeResult`
are already fixed in `spec.md`'s **Data Model** section — this document describes
their fields, validation rules, relationships, and lifecycle rather than duplicating
the interfaces verbatim.

---

## Entity: SearchResult

**Source**: React Query cache, key `['search', query, limit]` (not persisted)
**Origin**: Mapped server-side from Nominatim's response shape by `NominatimProvider`

| Field | Type | Constraint |
|---|---|---|
| `id` | `string` | Stable per provider; used as React list key |
| `displayName` | `string` | Non-empty; shown in `SearchResultItem` |
| `lat` | `number` | -90..90 |
| `lng` | `number` | -180..180 |
| `boundingBox` | `[number, number, number, number]?` | Informational only — never used to compute navigation zoom (fixed at 16 per FR-019) |
| `category` | `string?` | Free-form provider category, shown as a subtitle when present |
| `importance` | `number?` | Provider relevance score; used only for provider-side ranking, not re-sorted client-side |

**Lifecycle**: Created fresh on every successful `GET /api/search` response; never
mutated client-side. A `SearchResult` becomes a `RecentSearch.result` snapshot when
selected — the snapshot is **not** kept in sync with any later change to the live
search cache (recent searches are historical records, not live references).

---

## Entity: RecentSearch

**Source**: `features/search/store/searchStore.ts` (Zustand)
**Persistence**: `localStorage` key `spatialMind:recentSearches`, via `persist`
middleware — same mechanism as Phase 1's `themeStore`

| Field | Type | Constraint |
|---|---|---|
| `id` | `string` | Unique per entry; generated at insert time |
| `query` | `string` | The original typed query, for display/debugging only |
| `result` | `SearchResult` | Snapshot at selection time (see lifecycle note above) |
| `searchedAt` | `string` (ISO 8601) | Updated to "now" on re-selection, not just first creation |

**Validation Rules**:
- List MUST be capped at 10 entries (FR-021); inserting an 11th evicts the oldest by
  `searchedAt`.
- Re-selecting an existing entry (matched by `result.id`) MUST move it to the top and
  refresh `searchedAt`, MUST NOT create a duplicate (FR-022).
- If `localStorage` is unavailable (private browsing, quota exceeded), the store
  MUST continue to function in-memory for the current session without throwing.

**State Transitions**:

```
[] ──(select result A)──────────────→ [A]
[A] ──(select result B)─────────────→ [B, A]
[B, A] ──(re-select A)──────────────→ [A, B]              (moved to top, not duplicated)
[10 entries] ──(select new result)──→ [new, ...9 of previous 10]  (oldest evicted)
any ──(clear history)───────────────→ []
```

---

## Entity: ReverseGeocodeResult

**Source**: React Query cache, key `['reverseGeocode', lat, lng]` (not persisted)
**Origin**: Mapped server-side from Nominatim's response shape by `NominatimProvider`

| Field | Type | Constraint |
|---|---|---|
| `displayName` | `string` | Non-empty; the primary label shown in `ReverseGeocodePopup` |
| `lat` | `number` | -90..90; echoes or resolves the queried point |
| `lng` | `number` | -180..180 |
| `address` | `{ road?, city?, state?, country?, postalCode? }?` | All sub-fields optional — provider coverage varies by location |

**Null case**: The Route Handler returns `{ result: null }` (HTTP 200, not an error)
when coordinates are valid but no address resolves (e.g., open ocean) — this is a
first-class outcome, not an error state, per FR-025.

---

## Entity: SearchUIState (searchStore shape)

**Source**: `features/search/store/searchStore.ts` (Zustand) — the only mutation path
for anything in this table

| Field | Type | Persisted? | Notes |
|---|---|---|---|
| `query` | `string` | No | Raw input value; feeds `useDebounce` → `useSearch` |
| `isDropdownOpen` | `boolean` | No | Controls `SearchResults`/`SearchHistory` visibility |
| `highlightedIndex` | `number` | No | Managed by `cmdk`; mirrored here only if a non-`cmdk` consumer needs it |
| `selectedLocation` | `SearchResult \| ReverseGeocodeResult \| null` | No | Drives `SearchMarker` placement and `map.flyTo()` |
| `reverseGeocodePoint` | `LatLng \| null` | No | Non-null while `ReverseGeocodePopup` is open |
| `recentSearches` | `RecentSearch[]` | **Yes** | See Entity: RecentSearch above |

**Validation Rules**:
- `selectedLocation` and `reverseGeocodePoint` are independent — selecting a search
  result MUST clear any open `reverseGeocodePoint` (and vice versa), since only one
  active marker/popup is meaningful at a time (spec Assumption: "Single active
  marker").
- `query` shorter than 2 trimmed characters MUST NOT cause `isDropdownOpen` to show a
  live-results view; it shows `SearchHistory` instead (FR-005/FR-014).

---

## Entity: SearchApiError

**Source**: Route Handler error responses (`GET /api/search`, `GET /api/reverse-geocode`)

| Field | Type | Constraint |
|---|---|---|
| `code` | `'INVALID_QUERY' \| 'INVALID_COORDINATES' \| 'PROVIDER_UNAVAILABLE' \| 'RATE_LIMITED'` | Closed union — see `spec.md` API Requirements for the authoritative list per endpoint |
| `message` | `string` | Human-readable; safe to display, never a raw upstream/stack-trace string |

**Relationship**: Consumed by `SearchErrorState` and `ReverseGeocodePopup`'s error
variant to branch UI copy/behavior by `code` (e.g., `RATE_LIMITED` shows a
"please wait" message rather than a generic Retry prompt).

---

## Shared Types Referenced (unchanged from Phase 1)

| Type | Definition | Source |
|---|---|---|
| `LatLng` | `{ lat: number; lng: number }` | `shared/types/common.types.ts` |
| `Nullable<T>` | `T \| null` | `shared/types/common.types.ts` |
