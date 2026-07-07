"use client"

import { Button } from "@/shared/components/ui/button"
import { useSearchHistory } from "@/features/search/hooks/useSearchHistory"
import { useSearchStore } from "@/features/search/store/searchStore"
import { SearchResultItem } from "@/features/search/components/SearchResultItem"
import type { SearchResult } from "@/features/search/types/search.types"

interface SearchHistoryProps {
  onSelect: (result: SearchResult) => void
}

/**
 * Renders the persisted recent-searches list (most recent first) plus a
 * "Clear history" action. Renders `null` when the list is empty — an empty
 * history is not the same condition as "no search results".
 */
export function SearchHistory({ onSelect }: SearchHistoryProps) {
  const { recentSearches, clearRecentSearches } = useSearchHistory()
  const highlightedIndex = useSearchStore((s) => s.highlightedIndex)

  if (recentSearches.length === 0) {
    return null
  }

  return (
    <div>
      {recentSearches.map((entry, index) => (
        <SearchResultItem
          key={entry.id}
          result={entry.result}
          query=""
          isHighlighted={index === highlightedIndex}
          onSelect={onSelect}
          index={index}
        />
      ))}
      <div className="border-t px-2 py-1.5">
        <Button type="button" variant="ghost" size="sm" onClick={clearRecentSearches}>
          Clear history
        </Button>
      </div>
    </div>
  )
}
