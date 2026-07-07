"use client"

import { useSearchStore } from "@/features/search/store/searchStore"
import type { RecentSearch, SearchResult } from "@/features/search/types/search.types"

interface UseSearchHistoryResult {
  recentSearches: RecentSearch[]
  addRecentSearch: (query: string, result: SearchResult) => void
  clearRecentSearches: () => void
}

/** Zustand-backed accessor for the persisted recent-searches list — no network access. */
export function useSearchHistory(): UseSearchHistoryResult {
  const recentSearches = useSearchStore((s) => s.recentSearches)
  const addRecentSearch = useSearchStore((s) => s.addRecentSearch)
  const clearRecentSearches = useSearchStore((s) => s.clearRecentSearches)

  return { recentSearches, addRecentSearch, clearRecentSearches }
}
