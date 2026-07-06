# Store API Contract: searchStore

**Feature**: 002-search
**Location**: `features/search/store/searchStore.ts`

Shape and actions only — no implementation code. See `data-model.md` > "Entity:
SearchUIState" for field-level validation rules.

```typescript
interface SearchStoreState {
  query: string;
  isDropdownOpen: boolean;
  highlightedIndex: number;
  selectedLocation: SearchResult | ReverseGeocodeResult | null;
  reverseGeocodePoint: LatLng | null;
  recentSearches: RecentSearch[]; // persisted slice
}

interface SearchStoreActions {
  setQuery: (query: string) => void;
  openDropdown: () => void;
  closeDropdown: () => void;
  setHighlightedIndex: (index: number) => void;
  selectLocation: (location: SearchResult | ReverseGeocodeResult) => void;
  setReverseGeocodePoint: (point: LatLng | null) => void;
  addRecentSearch: (query: string, result: SearchResult) => void;
  clearRecentSearches: () => void;
}

type SearchStore = SearchStoreState & SearchStoreActions;
```

**Invariants** (enforced inside the actions, not by callers):
- `selectLocation` MUST clear `reverseGeocodePoint` if set, and vice versa
  (`setReverseGeocodePoint` with a non-null value MUST clear `selectedLocation`) —
  only one is ever active, per the spec's "single active marker" assumption.
- `addRecentSearch` MUST de-duplicate by `result.id`, moving an existing match to the
  top with a refreshed `searchedAt` rather than inserting a new entry.
- `addRecentSearch` MUST evict the oldest entry (by `searchedAt`) once the list would
  exceed 10 entries.

**Persistence**: Only `recentSearches` is persisted (Zustand `persist` middleware,
`localStorage` key `spatialMind:recentSearches`). All other fields reset on page
load, consistent with Phase 1's `mapStore` (view state is not persisted).
