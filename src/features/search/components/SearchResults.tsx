"use client"

import { useDebounce } from "@/shared/hooks/useDebounce"
import { useSearch } from "@/features/search/hooks/useSearch"
import { useSearchStore } from "@/features/search/store/searchStore"
import { SearchLoading } from "@/features/search/components/SearchLoading"
import { SearchErrorState } from "@/features/search/components/SearchErrorState"
import { SearchEmptyState } from "@/features/search/components/SearchEmptyState"
import { SearchResultItem } from "@/features/search/components/SearchResultItem"
import type { SearchResult } from "@/features/search/types/search.types"

const DEBOUNCE_MS = 300

interface SearchResultsProps {
  /** Currently highlighted index, for ARIA active-descendant wiring. */
  highlightedIndex: number
  /** Invoked when a result is chosen via click or Enter. */
  onSelect: (result: SearchResult) => void
}

/**
 * Owns the `useSearch` React Query call for the current (debounced) query and
 * switches between loading, error, empty, and list render variants — no
 * results data is duplicated into `searchStore`.
 */
export function SearchResults({ highlightedIndex, onSelect }: SearchResultsProps) {
  const query = useSearchStore((s) => s.query)
  const debouncedQuery = useDebounce(query, DEBOUNCE_MS)
  const { data, isLoading, isError, error, refetch } = useSearch(debouncedQuery)

  const announcement = isLoading
    ? "Searching…"
    : isError
      ? (error?.message ?? "Search failed")
      : data
        ? `${data.length} result${data.length === 1 ? "" : "s"} found`
        : ""

  return (
    <div>
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>

      {isLoading && <SearchLoading label="Searching places" />}

      {!isLoading && isError && error && (
        <SearchErrorState error={error} onRetry={() => void refetch()} />
      )}

      {!isLoading && !isError && data && data.length === 0 && (
        <SearchEmptyState variant="no-results" query={debouncedQuery} />
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <>
          {data.map((result, index) => (
            <SearchResultItem
              key={result.id}
              result={result}
              query={debouncedQuery}
              isHighlighted={index === highlightedIndex}
              onSelect={onSelect}
              index={index}
            />
          ))}
        </>
      )}
    </div>
  )
}
