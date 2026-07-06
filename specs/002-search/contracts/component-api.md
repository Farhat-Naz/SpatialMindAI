# Component API Contracts: Search Feature

**Feature**: 002-search

Prop shapes for every component in `features/search/components/`. Interfaces only —
no implementation code.

---

## SearchBox

```typescript
interface SearchBoxProps {
  /** Optional placeholder override; defaults to "Search places…" */
  placeholder?: string;
  /** Optional className passthrough for layout inside Navbar's Toolbar */
  className?: string;
}
```

Owns no external state via props — reads/writes `searchStore` directly and composes
`SearchResults`/`SearchHistory` internally. Exported from the feature's public barrel.

---

## SearchResults

```typescript
interface SearchResultsProps {
  /** Currently highlighted index, for ARIA active-descendant wiring */
  highlightedIndex: number;
  /** Invoked when a result is chosen via click or Enter */
  onSelect: (result: SearchResult) => void;
}
```

Internally consumes `useSearch(debouncedQuery)` — does not receive results via props,
since it owns the React Query call itself (keeps `SearchBox` free of query concerns).

---

## SearchResultItem

```typescript
interface SearchResultItemProps {
  result: SearchResult;
  /** The current query text, used only to render highlightMatch */
  query: string;
  isHighlighted: boolean;
  onSelect: (result: SearchResult) => void;
}
```

Purely presentational — no internal state, no store access. Reused by both
`SearchResults` and `SearchHistory`.

---

## SearchHistory

```typescript
interface SearchHistoryProps {
  onSelect: (result: SearchResult) => void;
}
```

Reads `useSearchHistory()` internally; renders nothing (returns `null`) when the list
is empty rather than an empty-state placeholder (an empty *history* is not the same
condition as "no search results," per spec Edge Cases).

---

## SearchLoading

```typescript
interface SearchLoadingProps {
  /** Accessible label describing what is loading, e.g. "Searching places" or
   *  "Looking up address" */
  label: string;
}
```

---

## SearchEmptyState

```typescript
interface SearchEmptyStateProps {
  variant: "no-results" | "start-typing";
  /** Only meaningful for "no-results"; echoes the query in the message */
  query?: string;
}
```

---

## SearchErrorState

```typescript
interface SearchErrorStateProps {
  error: SearchApiError;
  onRetry: () => void;
}
```

Renders `error.message` verbatim (already user-safe per the API contract) and a
Retry button wired to `onRetry`.

---

## ReverseGeocodePopup

```typescript
interface ReverseGeocodePopupProps {
  point: LatLng;
  onClose: () => void;
}
```

Internally calls `useReverseGeocode(point)`; renders `SearchLoading`,
`SearchErrorState`, an inline address view, or `SearchEmptyState` with
`variant="no-results"` when `result` is `null`, depending on query state.
