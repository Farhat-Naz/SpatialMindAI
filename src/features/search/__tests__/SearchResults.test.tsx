import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { Command, CommandList } from "@/shared/components/ui/command"
import { SearchResults } from "../components/SearchResults"
import { useSearchStore } from "../store/searchStore"
import type { SearchResult } from "../types/search.types"

vi.mock("../hooks/useSearch", () => ({ useSearch: vi.fn() }))

import { useSearch } from "../hooks/useSearch"

const RESULTS: SearchResult[] = [
  { id: "1", displayName: "Paris, France", lat: 48.85, lng: 2.35 },
  { id: "2", displayName: "Paris, Texas", lat: 33.66, lng: -95.55 },
]

function mockUseSearch(overrides: Partial<ReturnType<typeof useSearch>>) {
  vi.mocked(useSearch).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  })
}

function renderResults() {
  return render(
    <Command loop shouldFilter={false}>
      <CommandList>
        <SearchResults highlightedIndex={-1} onSelect={vi.fn()} />
      </CommandList>
    </Command>
  )
}

describe("SearchResults", () => {
  beforeEach(() => {
    useSearchStore.setState({ query: "paris" })
    vi.mocked(useSearch).mockReset()
  })

  it("renders the loading variant", () => {
    mockUseSearch({ isLoading: true })
    renderResults()

    expect(screen.getByRole("status")).toBeTruthy()
  })

  it("renders the error variant with the API error message", () => {
    mockUseSearch({
      isError: true,
      error: { code: "PROVIDER_UNAVAILABLE", message: "Search is temporarily unavailable" },
    })
    renderResults()

    expect(screen.getByText("Search is temporarily unavailable", { selector: "p" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy()
  })

  it("renders the empty (no-results) variant", () => {
    mockUseSearch({ data: [] })
    renderResults()

    expect(screen.getByText(/No results found/)).toBeTruthy()
  })

  it("renders a list of results", () => {
    mockUseSearch({ data: RESULTS })
    renderResults()

    expect(screen.getAllByRole("option")).toHaveLength(2)
  })

  it("announces the result count via the aria-live region", () => {
    mockUseSearch({ data: RESULTS })
    const { container } = renderResults()

    const liveRegion = container.querySelector('[aria-live="polite"]')
    expect(liveRegion?.textContent).toBe("2 results found")
  })

  it("exactly one render variant is shown at a time", () => {
    mockUseSearch({ isLoading: true })
    renderResults()

    expect(screen.queryByRole("option")).toBeNull()
    expect(screen.queryByRole("button", { name: "Retry" })).toBeNull()
  })
})
