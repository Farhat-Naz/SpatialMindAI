# Hook API Contracts: Search Feature

**Feature**: 002-search

Signatures and return shapes only — no implementation code.

---

## useSearch

```typescript
function useSearch(query: string, limit?: number): {
  data: SearchResult[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: SearchApiError | null;
  refetch: () => void;
};
```

- **Backing store**: React Query, key `queryKeys.search(query, limit)`.
- **Enabled condition**: `query.trim().length >= 2`.
- Callers are expected to pass an already-*debounced* `query` (via `useDebounce`) —
  this hook itself does not debounce.

---

## useSearchHistory

```typescript
function useSearchHistory(): {
  recentSearches: RecentSearch[];
  addRecentSearch: (query: string, result: SearchResult) => void;
  clearRecentSearches: () => void;
};
```

- **Backing store**: `searchStore` (Zustand), `recentSearches` slice (persisted).
- No network access; no loading/error state, since it is pure client-state.

---

## useReverseGeocode

```typescript
function useReverseGeocode(point: LatLng | null): {
  data: ReverseGeocodeResult | null | undefined;
  isLoading: boolean;
  isError: boolean;
  error: SearchApiError | null;
  refetch: () => void;
};
```

- **Backing store**: React Query, key `queryKeys.reverseGeocode(point)`.
- **Enabled condition**: `point !== null`.
- `data === null` (as opposed to `undefined`) is the resolved "no address found"
  outcome — callers MUST distinguish `null` (resolved, no result) from `undefined`
  (not yet resolved/loading).

---

## useDebounce

```typescript
function useDebounce<T>(value: T, delayMs: number): T;
```

- **Location**: `shared/hooks/useDebounce.ts` (see Research Decision 2) — re-exported
  from `features/search/hooks/index.ts`.
- Generic; carries no search-specific behavior.

---

## useMapSearchIntegration

```typescript
function useMapSearchIntegration(): void;
```

- **Backing store**: Reads both `searchStore.selectedLocation` and
  `searchStore.reverseGeocodePoint`; calls Leaflet's imperative `map.flyTo()` and
  marker-management APIs as a side effect.
- Returns nothing — it is a glue hook mounted once inside `MapCore`, not a data
  source for components to read from.
