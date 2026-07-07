import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { useSearch } from "../hooks/useSearch"
import { SearchServiceError } from "../services/searchService"

vi.mock("../services/searchService", async () => {
  const actual = await vi.importActual<typeof import("../services/searchService")>(
    "../services/searchService"
  )
  return { ...actual, search: vi.fn() }
})

import { search } from "../services/searchService"

function createWrapper() {
  const queryClient = new QueryClient()
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe("useSearch", () => {
  beforeEach(() => {
    vi.mocked(search).mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("does not fire for a query below the 2-character minimum", () => {
    renderHook(() => useSearch("a"), { wrapper: createWrapper() })

    expect(search).not.toHaveBeenCalled()
  })

  it("does not fire for an empty query", () => {
    renderHook(() => useSearch(""), { wrapper: createWrapper() })

    expect(search).not.toHaveBeenCalled()
  })

  it("fires and returns results for a 2+ character query", async () => {
    const results = [{ id: "1", displayName: "Paris", lat: 48.85, lng: 2.35 }]
    vi.mocked(search).mockResolvedValueOnce(results)

    const { result } = renderHook(() => useSearch("paris"), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toEqual(results)
    expect(search).toHaveBeenCalledWith("paris", 8)
  })

  it("does not retry a non-PROVIDER_UNAVAILABLE error", async () => {
    vi.mocked(search).mockRejectedValue(
      new SearchServiceError({ code: "INVALID_QUERY", message: "bad" })
    )

    const { result } = renderHook(() => useSearch("paris"), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(search).toHaveBeenCalledTimes(1)
  })
})
