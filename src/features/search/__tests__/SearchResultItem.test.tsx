import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { Command, CommandList } from "@/shared/components/ui/command"
import { SearchResultItem } from "../components/SearchResultItem"
import type { SearchResult } from "../types/search.types"

const RESULT: SearchResult = {
  id: "1",
  displayName: "Paris, France",
  lat: 48.85,
  lng: 2.35,
  category: "city",
}

function renderItem(onSelect: (result: SearchResult) => void, isHighlighted = false) {
  return render(
    <Command loop shouldFilter={false}>
      <CommandList>
        <SearchResultItem
          result={RESULT}
          query="par"
          isHighlighted={isHighlighted}
          onSelect={onSelect}
          index={0}
        />
      </CommandList>
    </Command>
  )
}

describe("SearchResultItem", () => {
  it("calls onSelect with the result on click", () => {
    const onSelect = vi.fn()
    renderItem(onSelect)

    fireEvent.click(screen.getByRole("option"))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(RESULT)
  })

  it("calls onSelect with the result on Enter", () => {
    const onSelect = vi.fn()
    renderItem(onSelect)

    const option = screen.getByRole("option")
    fireEvent.pointerMove(option)
    fireEvent.keyDown(option, { key: "Enter" })

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(RESULT)
  })

  it("renders highlightMatch segments for the display name", () => {
    renderItem(vi.fn())

    const option = screen.getByRole("option")
    expect(option.textContent).toContain("Paris, France")
    expect(option.querySelector("strong")?.textContent).toBe("Par")
  })

  it("renders the category as a subtitle", () => {
    renderItem(vi.fn())

    expect(screen.getByText("city")).toBeTruthy()
  })
})
