"use client"

import { forwardRef } from "react"
import { CommandInput } from "@/shared/components/ui/command"
import { useSearchStore } from "@/features/search/store/searchStore"

interface SearchInputProps {
  onFocus?: () => void
}

/** Controlled wrapper around shadcn's `CommandInput`, backed by `searchStore.query`. */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { onFocus },
  ref
) {
  const query = useSearchStore((s) => s.query)
  const setQuery = useSearchStore((s) => s.setQuery)

  return (
    <CommandInput
      ref={ref}
      value={query}
      onValueChange={setQuery}
      onFocus={onFocus}
      placeholder="Search places…"
    />
  )
})
