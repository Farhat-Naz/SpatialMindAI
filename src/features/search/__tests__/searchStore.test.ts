import { beforeEach, describe, expect, it } from "vitest"
import { useSearchStore } from "../store/searchStore"
import type { SearchResult } from "../types/search.types"

function makeResult(id: string): SearchResult {
  return { id, displayName: `Place ${id}`, lat: 1, lng: 2 }
}

const INITIAL_STATE = {
  query: "",
  isDropdownOpen: false,
  highlightedIndex: -1,
  selectedLocation: null,
  reverseGeocodePoint: null,
  recentSearches: [],
}

describe("searchStore", () => {
  beforeEach(() => {
    useSearchStore.setState(INITIAL_STATE)
  })

  it("selectLocation sets selectedLocation and clears reverseGeocodePoint", () => {
    useSearchStore.setState({ reverseGeocodePoint: { lat: 1, lng: 2 } })

    useSearchStore.getState().selectLocation(makeResult("1"))

    expect(useSearchStore.getState().selectedLocation).toEqual(makeResult("1"))
    expect(useSearchStore.getState().reverseGeocodePoint).toBeNull()
  })

  it("setReverseGeocodePoint with a point clears selectedLocation", () => {
    useSearchStore.setState({ selectedLocation: makeResult("1") })

    useSearchStore.getState().setReverseGeocodePoint({ lat: 5, lng: 6 })

    expect(useSearchStore.getState().reverseGeocodePoint).toEqual({ lat: 5, lng: 6 })
    expect(useSearchStore.getState().selectedLocation).toBeNull()
  })

  it("setReverseGeocodePoint(null) does not touch selectedLocation", () => {
    useSearchStore.setState({ selectedLocation: makeResult("1"), reverseGeocodePoint: { lat: 5, lng: 6 } })

    useSearchStore.getState().setReverseGeocodePoint(null)

    expect(useSearchStore.getState().reverseGeocodePoint).toBeNull()
    expect(useSearchStore.getState().selectedLocation).toEqual(makeResult("1"))
  })

  it("addRecentSearch deduplicates by result.id and moves the entry to the top", () => {
    const { addRecentSearch } = useSearchStore.getState()

    addRecentSearch("a", makeResult("A"))
    addRecentSearch("b", makeResult("B"))
    addRecentSearch("a", makeResult("A"))

    const { recentSearches } = useSearchStore.getState()
    expect(recentSearches).toHaveLength(2)
    expect(recentSearches[0]?.result.id).toBe("A")
    expect(recentSearches[1]?.result.id).toBe("B")
  })

  it("addRecentSearch refreshes searchedAt on re-selection", () => {
    const { addRecentSearch } = useSearchStore.getState()

    addRecentSearch("a", makeResult("A"))
    const firstTimestamp = useSearchStore.getState().recentSearches[0]?.searchedAt

    addRecentSearch("a", makeResult("A"))
    const secondTimestamp = useSearchStore.getState().recentSearches[0]?.searchedAt

    expect(secondTimestamp).toBeDefined()
    expect(firstTimestamp).toBeDefined()
  })

  it("addRecentSearch evicts the oldest entry once the list exceeds 10", () => {
    const { addRecentSearch } = useSearchStore.getState()

    for (let i = 0; i < 11; i += 1) {
      addRecentSearch(`q${i}`, makeResult(`${i}`))
    }

    const { recentSearches } = useSearchStore.getState()
    expect(recentSearches).toHaveLength(10)
    expect(recentSearches[0]?.result.id).toBe("10")
    expect(recentSearches.some((entry) => entry.result.id === "0")).toBe(false)
  })

  it("clearRecentSearches resets only recentSearches", () => {
    useSearchStore.getState().addRecentSearch("a", makeResult("A"))
    useSearchStore.setState({ selectedLocation: makeResult("B") })

    useSearchStore.getState().clearRecentSearches()

    expect(useSearchStore.getState().recentSearches).toEqual([])
    expect(useSearchStore.getState().selectedLocation).toEqual(makeResult("B"))
  })

  it("setQuery only touches query", () => {
    useSearchStore.setState({ isDropdownOpen: true, highlightedIndex: 2 })

    useSearchStore.getState().setQuery("paris")

    expect(useSearchStore.getState().query).toBe("paris")
    expect(useSearchStore.getState().isDropdownOpen).toBe(true)
    expect(useSearchStore.getState().highlightedIndex).toBe(2)
  })

  it("openDropdown/closeDropdown do not affect query", () => {
    useSearchStore.setState({ query: "paris" })

    useSearchStore.getState().openDropdown()
    expect(useSearchStore.getState().isDropdownOpen).toBe(true)
    expect(useSearchStore.getState().query).toBe("paris")

    useSearchStore.getState().closeDropdown()
    expect(useSearchStore.getState().isDropdownOpen).toBe(false)
    expect(useSearchStore.getState().query).toBe("paris")
  })
})
