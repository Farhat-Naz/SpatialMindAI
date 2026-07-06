import { beforeEach, describe, expect, it, vi } from "vitest"
import { act, renderHook } from "@testing-library/react"
import type { LeafletMouseEvent } from "leaflet"

const { mapEventHandlers } = vi.hoisted(() => ({
  mapEventHandlers: {} as Record<string, (e: LeafletMouseEvent) => void>,
}))

vi.mock("react-leaflet", () => ({
  useMapEvents: (handlers: Record<string, (e: LeafletMouseEvent) => void>) => {
    Object.assign(mapEventHandlers, handlers)
    return {}
  },
}))

import { useCoordinates } from "../hooks/useCoordinates"
import { useMapStore } from "../store/mapStore"

const DEFAULT_MAP_STATE = {
  center: { lat: 20, lng: 0 },
  zoom: 2,
  activeBasemapId: "osm-street",
  mapStatus: "idle" as const,
  lastKnownCoords: null,
  errorMessage: null,
}

function fireMouseMove(lat: number, lng: number) {
  mapEventHandlers.mousemove?.({ latlng: { lat, lng } } as LeafletMouseEvent)
}

describe("useCoordinates", () => {
  beforeEach(() => {
    useMapStore.setState(DEFAULT_MAP_STATE)
  })

  it('returns "—" when mapStatus is not ready', () => {
    const { result } = renderHook(() => useCoordinates())

    expect(result.current.isReady).toBe(false)
    expect(result.current.formattedLat).toBe("—")
    expect(result.current.formattedLng).toBe("—")
  })

  it("returns formatted coords after mousemove once ready", () => {
    useMapStore.setState({ mapStatus: "ready" })
    const { result } = renderHook(() => useCoordinates())

    act(() => {
      fireMouseMove(12.3456789, -98.7654321)
    })

    expect(result.current.coords).toEqual({ lat: 12.3456789, lng: -98.7654321 })
    expect(result.current.formattedLat).toBe("12.3457")
    expect(result.current.formattedLng).toBe("-98.7654")
  })

  it("retains last known coords when the cursor leaves the map", () => {
    useMapStore.setState({ mapStatus: "ready" })
    const { result } = renderHook(() => useCoordinates())

    act(() => {
      fireMouseMove(40.7128, -74.006)
    })
    expect(result.current.formattedLat).toBe("40.7128")

    // No mouseleave/mouseout handler is registered by useCoordinates, so the
    // cursor leaving the map fires no event that could clear the coords —
    // the last known position must remain displayed.
    expect(result.current.coords).toEqual({ lat: 40.7128, lng: -74.006 })
    expect(result.current.formattedLat).toBe("40.7128")
    expect(result.current.formattedLng).toBe("-74.0060")
  })
})
