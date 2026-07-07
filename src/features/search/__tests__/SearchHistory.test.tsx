import { beforeEach, describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { Command, CommandList } from "@/shared/components/ui/command"
import { SearchHistory } from "../components/SearchHistory"
import { useSearchStore } from "../store/searchStore"
import type { SearchResult } from "../types/search.types"

function makeResult(id: string): SearchResult {
  return { id, displayName: `Place ${id}`, lat: 1, lng: 2 }
}

function renderHistory() {
  return render(
    <Command loop shouldFilter={false}>
      <CommandList>
        <SearchHistory onSelect={vi.fn()} />
      </CommandList>
    </Command>
  )
}

describe("SearchHistory", () => {
  beforeEach(() => {
    useSearchStore.setState({ recentSearches: [], highlightedIndex: -1 })
  })

  it("renders nothing when the list is empty", () => {
    const { container } = renderHistory()

    expect(container.querySelector("[cmdk-item]")).toBeNull()
    expect(screen.queryByText("Clear history")).toBeNull()
  })

  it("renders an entry per recent search, most recent first", () => {
    useSearchStore.getState().addRecentSearch("a", makeResult("A"))
    useSearchStore.getState().addRecentSearch("b", makeResult("B"))

    renderHistory()

    const options = screen.getAllByRole("option")
    expect(options).toHaveLength(2)
    expect(options[0]?.textContent).toContain("Place B")
    expect(options[1]?.textContent).toContain("Place A")
  })

  it("clears the list when Clear history is clicked", () => {
    useSearchStore.getState().addRecentSearch("a", makeResult("A"))
    renderHistory()

    fireEvent.click(screen.getByText("Clear history"))

    expect(useSearchStore.getState().recentSearches).toEqual([])
  })
})
