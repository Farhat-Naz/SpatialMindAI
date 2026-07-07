import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { SearchErrorState } from "../components/SearchErrorState"
import { SearchEmptyState } from "../components/SearchEmptyState"

describe("SearchErrorState", () => {
  it("renders the error message and calls onRetry exactly once per click", () => {
    const onRetry = vi.fn()
    render(
      <SearchErrorState
        error={{ code: "PROVIDER_UNAVAILABLE", message: "Search is temporarily unavailable" }}
        onRetry={onRetry}
      />
    )

    expect(screen.getByText("Search is temporarily unavailable")).toBeTruthy()

    fireEvent.click(screen.getByRole("button", { name: "Retry" }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it("shows distinct copy for RATE_LIMITED", () => {
    render(
      <SearchErrorState
        error={{ code: "RATE_LIMITED", message: "generic message" }}
        onRetry={vi.fn()}
      />
    )

    expect(screen.getByText("Too many searches — please wait a moment")).toBeTruthy()
    expect(screen.queryByText("generic message")).toBeNull()
  })
})

describe("SearchEmptyState", () => {
  it("renders start-typing copy", () => {
    render(<SearchEmptyState variant="start-typing" />)

    expect(screen.getByText("Start typing to search for a place")).toBeTruthy()
  })

  it("renders no-results copy echoing the query", () => {
    render(<SearchEmptyState variant="no-results" query="atlantis" />)

    expect(screen.getByText('No results found for "atlantis"')).toBeTruthy()
  })

  it("the two variants render distinct copy", () => {
    const { rerender } = render(<SearchEmptyState variant="start-typing" />);
    const startTypingText = screen.getByText("Start typing to search for a place").textContent

    rerender(<SearchEmptyState variant="no-results" />)
    const noResultsText = screen.getByText("No results found").textContent

    expect(startTypingText).not.toBe(noResultsText)
  })
})
