"use client"

import { memo, useMemo } from "react"
import { MapPin } from "lucide-react"
import { CommandItem } from "@/shared/components/ui/command"
import { highlightMatch } from "@/features/search/utils/highlightMatch"
import { formatDistance } from "@/features/search/utils/formatDistance"
import type { SearchResult } from "@/features/search/types/search.types"

interface SearchResultItemProps {
  result: SearchResult
  /** The current (debounced) query text, used only to render `highlightMatch`. */
  query: string
  isHighlighted: boolean
  onSelect: (result: SearchResult) => void
  /** This item's position within its list — used as `cmdk`'s controlled `value`. */
  index: number
}

function SearchResultItemComponent({ result, query, isHighlighted, onSelect, index }: SearchResultItemProps) {
  const segments = useMemo(
    () => highlightMatch(result.displayName, query),
    [result.displayName, query]
  )
  const subtitle = formatDistance(result.category)

  return (
    <CommandItem
      value={String(index)}
      aria-selected={isHighlighted}
      onSelect={() => onSelect(result)}
      className="flex items-start gap-2"
    >
      <MapPin className="mt-0.5 h-4 w-4 shrink-0 opacity-60" aria-hidden="true" />
      <span className="flex min-w-0 flex-col">
        <span className="truncate">
          {segments.map((segment, segmentIndex) =>
            segment.isMatch ? (
              <strong key={segmentIndex} className="font-semibold">
                {segment.text}
              </strong>
            ) : (
              <span key={segmentIndex}>{segment.text}</span>
            )
          )}
        </span>
        {subtitle && <span className="truncate text-xs text-muted-foreground">{subtitle}</span>}
      </span>
    </CommandItem>
  )
}

/** Memoized on `result.id`/`isHighlighted`/`query` so highlight-only changes re-render just the affected rows. */
export const SearchResultItem = memo(
  SearchResultItemComponent,
  (prev, next) =>
    prev.result.id === next.result.id &&
    prev.isHighlighted === next.isHighlighted &&
    prev.query === next.query &&
    prev.index === next.index
)
