import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { useReverseGeocode } from "../hooks/useReverseGeocode"

vi.mock("../services/reverseGeocodeService", async () => {
  const actual = await vi.importActual<typeof import("../services/reverseGeocodeService")>(
    "../services/reverseGeocodeService"
  )
  return { ...actual, reverseGeocode: vi.fn() }
})

import { reverseGeocode } from "../services/reverseGeocodeService"

function createWrapper() {
  const queryClient = new QueryClient()
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe("useReverseGeocode", () => {
  beforeEach(() => {
    vi.mocked(reverseGeocode).mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("does not fire when point is null", () => {
    renderHook(() => useReverseGeocode(null), { wrapper: createWrapper() })

    expect(reverseGeocode).not.toHaveBeenCalled()
  })

  it("data is undefined while loading and distinguishable from a resolved null result", async () => {
    vi.mocked(reverseGeocode).mockResolvedValueOnce(null)

    const { result } = renderHook(() => useReverseGeocode({ lat: 0, lng: 0 }), {
      wrapper: createWrapper(),
    })

    expect(result.current.data).toBeUndefined()

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toBeNull()
  })

  it("returns the resolved address when found", async () => {
    const address = { displayName: "Paris, France", lat: 48.85, lng: 2.35 }
    vi.mocked(reverseGeocode).mockResolvedValueOnce(address)

    const { result } = renderHook(() => useReverseGeocode({ lat: 48.85, lng: 2.35 }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toEqual(address)
  })
})
