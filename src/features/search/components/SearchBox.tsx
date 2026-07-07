"use client"

import { useRef } from "react"
import { Command, CommandList } from "@/shared/components/ui/command"
import { useDebounce } from "@/shared/hooks/useDebounce"
import { useSearchStore } from "@/features/search/store/searchStore"
import { SearchInput } from "@/features/search/components/SearchInput"
import { SearchResults } from "@/features/search/components/SearchResults"
import { SearchHistory } from "@/features/search/components/SearchHistory"
import { cn } from "@/shared/lib/utils"
import type { SearchResult } from "@/features/search/types/search.types"

const DEBOUNCE_MS = 300
const MIN_QUERY_LENGTH = 2

interface SearchBoxProps {
  /** Optional placeholder override; SearchInput currently always uses "Search places…". */
  placeholder?: string
  className?: string
}

/**
 * The search feature's public entry point: a shadcn `Command` shell composing
 * `SearchInput` with a dropdown that switches between `SearchHistory` (empty
 * query) and `SearchResults` (2+ trimmed characters). Reads/writes
 * `searchStore` directly; renders no query results of its own.
 */
export function SearchBox({ className }: SearchBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const query = useSearchStore((s) => s.query)
  const isDropdownOpen = useSearchStore((s) => s.isDropdownOpen)
  const highlightedIndex = useSearchStore((s) => s.highlightedIndex)
  const openDropdown = useSearchStore((s) => s.openDropdown)
  const closeDropdown = useSearchStore((s) => s.closeDropdown)
  const setHighlightedIndex = useSearchStore((s) => s.setHighlightedIndex)
  const selectLocation = useSearchStore((s) => s.selectLocation)
  const addRecentSearch = useSearchStore((s) => s.addRecentSearch)

  const debouncedQuery = useDebounce(query, DEBOUNCE_MS)
  const showHistory = debouncedQuery.trim().length < MIN_QUERY_LENGTH

  function handleSelect(result: SearchResult) {
    selectLocation(result)
    addRecentSearch(query, result)
    closeDropdown()
    inputRef.current?.focus()
  }

  return (
    <div className={cn("relative w-full max-w-sm", className)}>
      <Command
        loop
        shouldFilter={false}
        value={String(highlightedIndex)}
        onValueChange={(value) => setHighlightedIndex(Number(value))}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            closeDropdown()
          }
        }}
        className="overflow-visible bg-transparent"
      >
        <SearchInput ref={inputRef} onFocus={openDropdown} />
        {isDropdownOpen && (
          <CommandList
            onMouseDown={(event) => event.preventDefault()}
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-75 rounded-md border bg-popover text-popover-foreground shadow-md"
          >
            {showHistory ? (
              <SearchHistory onSelect={handleSelect} />
            ) : (
              <SearchResults highlightedIndex={highlightedIndex} onSelect={handleSelect} />
            )}
          </CommandList>
        )}
      </Command>
    </div>
  )
}
