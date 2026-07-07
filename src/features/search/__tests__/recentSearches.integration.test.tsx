import { beforeEach, describe, expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { SearchBox } from "../components/SearchBox"
import { useSearchStore } from "../store/searchStore"

vi.mock("../services/searchService", async () => {
  const actual = await vi.importActual<typeof import("../services/searchService")>(
    "../services/searchService"
  )
  return { ...actual, search: vi.fn() }
})

import { search } from "../services/searchService"

const RESULT = { id: "1", displayName: "Paris, France", lat: 48.85, lng: 2.35 }

function renderSearchBox() {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <SearchBox />
    </QueryClientProvider>
  )
}

describe("Recent searches integration", () => {
  beforeEach(() => {
    window.localStorage.clear()
    useSearchStore.setState({
      query: "",
      isDropdownOpen: false,
      highlightedIndex: -1,
      selectedLocation: null,
      reverseGeocodePoint: null,
      recentSearches: [],
    })
    vi.mocked(search).mockReset()
    vi.mocked(search).mockResolvedValue([RESULT])
  })

  it("selects a result, shows it in history on empty query, dedups on re-select, persists, and clears", async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem")

    renderSearchBox()
    const input = screen.getByPlaceholderText("Search places…")

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: "paris" } })
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1))

    fireEvent.click(screen.getByRole("option"))
    expect(useSearchStore.getState().recentSearches).toHaveLength(1)

    // Persisted under the documented key with the expected payload (use the
    // most recent write — the initial empty-array hydration write also
    // matches the key).
    await waitFor(() => {
      const calls = setItemSpy.mock.calls.filter(([key]) => key === "spatialMind:recentSearches")
      const lastCall = calls.at(-1)
      expect(lastCall).toBeDefined()
      expect(lastCall?.[1]).toContain(RESULT.id)
    })

    // Clearing the query shows history immediately.
    fireEvent.change(input, { target: { value: "" } })
    fireEvent.focus(input)
    await waitFor(() => expect(screen.getByText("Clear history")).toBeTruthy())
    expect(screen.getAllByRole("option")).toHaveLength(1)

    // Re-selecting the same entry from history dedups rather than duplicating.
    fireEvent.click(screen.getByRole("option"))
    expect(useSearchStore.getState().recentSearches).toHaveLength(1)

    // Clear history empties the list.
    fireEvent.focus(input)
    fireEvent.click(screen.getByText("Clear history"))
    expect(useSearchStore.getState().recentSearches).toEqual([])
  })
})
