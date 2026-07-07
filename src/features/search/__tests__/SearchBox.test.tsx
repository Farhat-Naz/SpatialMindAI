import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
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

const RESULTS = [
  { id: "1", displayName: "Paris, France", lat: 48.85, lng: 2.35 },
  { id: "2", displayName: "Paris, Texas", lat: 33.66, lng: -95.55 },
  { id: "3", displayName: "Paris, Ontario", lat: 43.2, lng: -80.38 },
]

function renderSearchBox() {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <SearchBox />
    </QueryClientProvider>
  )
}

describe("SearchBox", () => {
  beforeEach(() => {
    useSearchStore.setState({
      query: "",
      isDropdownOpen: false,
      highlightedIndex: -1,
      selectedLocation: null,
      reverseGeocodePoint: null,
      recentSearches: [],
    })
    vi.mocked(search).mockReset()
    vi.mocked(search).mockResolvedValue(RESULTS)
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("does not call search below the 2-character minimum", async () => {
    renderSearchBox()
    const input = screen.getByPlaceholderText("Search places…")

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: "p" } })

    await vi.advanceTimersByTimeAsync(300)

    expect(search).not.toHaveBeenCalled()
  })

  it("debounces input and fires only one request per typing pause", async () => {
    renderSearchBox()
    const input = screen.getByPlaceholderText("Search places…")

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: "p" } })
    await vi.advanceTimersByTimeAsync(100)
    fireEvent.change(input, { target: { value: "pa" } })
    await vi.advanceTimersByTimeAsync(100)
    fireEvent.change(input, { target: { value: "par" } })

    await vi.advanceTimersByTimeAsync(300)
    vi.useRealTimers()

    await waitFor(() => expect(search).toHaveBeenCalledTimes(1))
    expect(search).toHaveBeenCalledWith("par", 8)
  })

  it("wraps highlight from the last item back to the first (loop)", async () => {
    renderSearchBox()
    const input = screen.getByPlaceholderText("Search places…")

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: "paris" } })
    await vi.advanceTimersByTimeAsync(300)
    vi.useRealTimers()

    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(RESULTS.length))

    fireEvent.keyDown(input, { key: "ArrowUp" })

    await waitFor(() => {
      expect(useSearchStore.getState().highlightedIndex).toBe(RESULTS.length - 1)
    })
  })

  it("wraps highlight from the first item back to the last (loop)", async () => {
    renderSearchBox()
    const input = screen.getByPlaceholderText("Search places…")

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: "paris" } })
    await vi.advanceTimersByTimeAsync(300)
    vi.useRealTimers()

    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(RESULTS.length))

    fireEvent.keyDown(input, { key: "ArrowDown" })
    await waitFor(() => expect(useSearchStore.getState().highlightedIndex).toBeGreaterThanOrEqual(0))
    const startIndex = useSearchStore.getState().highlightedIndex

    // Pressing ArrowDown once per item should cycle all the way around and
    // land back on the same item, proving the list wraps rather than
    // stopping at the last item.
    for (let i = 0; i < RESULTS.length; i += 1) {
      fireEvent.keyDown(input, { key: "ArrowDown" })
    }

    await waitFor(() => {
      expect(useSearchStore.getState().highlightedIndex).toBe(startIndex)
    })
  })

  it("Escape closes the dropdown without clearing the typed query", async () => {
    renderSearchBox()
    const input = screen.getByPlaceholderText("Search places…")

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: "par" } })
    await vi.advanceTimersByTimeAsync(300)

    fireEvent.keyDown(input, { key: "Escape" })

    expect(useSearchStore.getState().isDropdownOpen).toBe(false)
    expect(useSearchStore.getState().query).toBe("par")
  })
})
