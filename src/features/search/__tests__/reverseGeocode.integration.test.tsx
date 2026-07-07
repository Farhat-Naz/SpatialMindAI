import { beforeEach, describe, expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { ReverseGeocodePopup } from "../components/ReverseGeocodePopup"
import { useMapSearchIntegration } from "../hooks/useMapSearchIntegration"
import { useSearchStore } from "../store/searchStore"

const { mapEventHandlers } = vi.hoisted(() => ({
  mapEventHandlers: {} as Record<string, (...args: never[]) => void>,
}))

vi.mock("react-leaflet", () => ({
  useMap: () => ({
    flyTo: vi.fn(),
    getCenter: () => ({ lat: 0, lng: 0 }),
    getZoom: () => 2,
    getContainer: () => document.createElement("div"),
  }),
  useMapEvents: (handlers: Record<string, (...args: never[]) => void>) => {
    Object.assign(mapEventHandlers, handlers)
    return {}
  },
  Marker: ({ children }: { children?: ReactNode }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }: { children?: ReactNode }) => <div data-testid="popup">{children}</div>,
}))

vi.mock("../services/reverseGeocodeService", async () => {
  const actual = await vi.importActual<typeof import("../services/reverseGeocodeService")>(
    "../services/reverseGeocodeService"
  )
  return { ...actual, reverseGeocode: vi.fn() }
})

import { reverseGeocode } from "../services/reverseGeocodeService"

function Harness() {
  useMapSearchIntegration()
  const reverseGeocodePoint = useSearchStore((s) => s.reverseGeocodePoint)
  const setReverseGeocodePoint = useSearchStore((s) => s.setReverseGeocodePoint)

  if (!reverseGeocodePoint) {
    return null
  }
  return (
    <ReverseGeocodePopup
      point={reverseGeocodePoint}
      onClose={() => setReverseGeocodePoint(null)}
    />
  )
}

function renderHarness() {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <Harness />
    </QueryClientProvider>
  )
}

function clickMap(lat: number, lng: number) {
  mapEventHandlers.click?.({ latlng: { lat, lng } } as never)
}

describe("Reverse geocoding integration", () => {
  beforeEach(() => {
    useSearchStore.setState({
      selectedLocation: null,
      reverseGeocodePoint: null,
    })
    vi.mocked(reverseGeocode).mockReset()
  })

  it("map click opens the popup, resolves an address, and dismiss clears the point", async () => {
    vi.mocked(reverseGeocode).mockResolvedValue({
      displayName: "Paris, France",
      lat: 48.85,
      lng: 2.35,
    })

    renderHarness()
    clickMap(48.85, 2.35)

    await waitFor(() => expect(screen.getByText("Paris, France")).toBeTruthy())

    fireEvent.click(screen.getByRole("button", { name: "Close address details" }))

    expect(useSearchStore.getState().reverseGeocodePoint).toBeNull()
  })

  it("shows the no-results empty state for a point with no address, not an error", async () => {
    vi.mocked(reverseGeocode).mockResolvedValue(null)

    renderHarness()
    clickMap(0, 0)

    await waitFor(() => expect(screen.getByText("No results found")).toBeTruthy())
    expect(screen.queryByRole("button", { name: "Retry" })).toBeNull()
  })

  it("ignores map clicks while a flyTo animation is in progress", async () => {
    renderHarness()

    mapEventHandlers.movestart?.()
    clickMap(48.85, 2.35)

    expect(useSearchStore.getState().reverseGeocodePoint).toBeNull()
  })
})
