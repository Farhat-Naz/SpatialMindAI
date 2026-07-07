import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { RecentSearch, ReverseGeocodeResult, SearchResult } from "@/features/search/types/search.types"
import type { LatLng } from "@/shared/types/common.types"

const MAX_RECENT_SEARCHES = 10

interface SearchStoreState {
  query: string
  isDropdownOpen: boolean
  highlightedIndex: number
  selectedLocation: SearchResult | ReverseGeocodeResult | null
  reverseGeocodePoint: LatLng | null
  /** Persisted slice — most-recent-first, deduplicated by `result.id`. */
  recentSearches: RecentSearch[]
}

interface SearchStoreActions {
  setQuery: (query: string) => void
  openDropdown: () => void
  closeDropdown: () => void
  setHighlightedIndex: (index: number) => void
  selectLocation: (location: SearchResult | ReverseGeocodeResult) => void
  setReverseGeocodePoint: (point: LatLng | null) => void
  addRecentSearch: (query: string, result: SearchResult) => void
  clearRecentSearches: () => void
}

type SearchStore = SearchStoreState & SearchStoreActions

const initialState: SearchStoreState = {
  query: "",
  isDropdownOpen: false,
  highlightedIndex: -1,
  selectedLocation: null,
  reverseGeocodePoint: null,
  recentSearches: [],
}

/**
 * Client/UI state for the search feature (Constitution Principle IV) — the
 * only mutation path for query text, dropdown/highlight state, the single
 * active selection (search result XOR reverse-geocode point), and the
 * persisted recent-searches list.
 */
export const useSearchStore = create<SearchStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setQuery: (query) => set({ query }),

      openDropdown: () => set({ isDropdownOpen: true }),

      closeDropdown: () => set({ isDropdownOpen: false }),

      setHighlightedIndex: (highlightedIndex) => set({ highlightedIndex }),

      selectLocation: (location) =>
        set({ selectedLocation: location, reverseGeocodePoint: null }),

      setReverseGeocodePoint: (point) =>
        set(
          point === null
            ? { reverseGeocodePoint: null }
            : { reverseGeocodePoint: point, selectedLocation: null }
        ),

      addRecentSearch: (query, result) => {
        const withoutExisting = get().recentSearches.filter(
          (entry) => entry.result.id !== result.id
        )
        const entry: RecentSearch = {
          id: result.id,
          query,
          result,
          searchedAt: new Date().toISOString(),
        }
        set({ recentSearches: [entry, ...withoutExisting].slice(0, MAX_RECENT_SEARCHES) })
      },

      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: "spatialMind:recentSearches",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ recentSearches: state.recentSearches }),
    }
  )
)
