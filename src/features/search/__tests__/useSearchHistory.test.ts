import { beforeEach, describe, expect, it } from "vitest"
import { act, renderHook } from "@testing-library/react"
import { useSearchHistory } from "../hooks/useSearchHistory"
import { useSearchStore } from "../store/searchStore"
import type { SearchResult } from "../types/search.types"

function makeResult(id: string): SearchResult {
  return { id, displayName: `Place ${id}`, lat: 1, lng: 2 }
}

describe("useSearchHistory", () => {
  beforeEach(() => {
    useSearchStore.setState({ recentSearches: [] })
  })

  it("adds an entry via addRecentSearch", () => {
    const { result } = renderHook(() => useSearchHistory())

    act(() => {
      result.current.addRecentSearch("a", makeResult("A"))
    })

    expect(result.current.recentSearches).toHaveLength(1)
    expect(result.current.recentSearches[0]?.result.id).toBe("A")
  })

  it("moves a re-selected entry to the top without duplicating", () => {
    const { result } = renderHook(() => useSearchHistory())

    act(() => {
      result.current.addRecentSearch("a", makeResult("A"))
      result.current.addRecentSearch("b", makeResult("B"))
      result.current.addRecentSearch("a", makeResult("A"))
    })

    expect(result.current.recentSearches).toHaveLength(2)
    expect(result.current.recentSearches[0]?.result.id).toBe("A")
  })

  it("clears all entries via clearRecentSearches", () => {
    const { result } = renderHook(() => useSearchHistory())

    act(() => {
      result.current.addRecentSearch("a", makeResult("A"))
      result.current.clearRecentSearches()
    })

    expect(result.current.recentSearches).toEqual([])
  })
})
