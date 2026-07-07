"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Marker, Popup, useMap } from "react-leaflet"
import type { DivIcon, Marker as LeafletMarkerInstance } from "leaflet"
import { X } from "lucide-react"
import { useReverseGeocode } from "@/features/search/hooks/useReverseGeocode"
import { SearchLoading } from "@/features/search/components/SearchLoading"
import { SearchErrorState } from "@/features/search/components/SearchErrorState"
import { SearchEmptyState } from "@/features/search/components/SearchEmptyState"
import type { LatLng } from "@/shared/types/common.types"

interface ReverseGeocodePopupProps {
  point: LatLng
  onClose: () => void
}

const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-secondary-foreground,#334)"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>`

/**
 * Map-click popup for reverse geocoding: calls `useReverseGeocode(point)` and
 * renders the loading/error/empty/address view accordingly. Only mounted by
 * its caller while `point` is non-null (T100), and owns its own close
 * button/Escape handling rather than Leaflet's built-in popup lifecycle, so
 * dismissal never races with a new map click setting a fresh point.
 * `leaflet` is loaded lazily on mount (not at module scope) so this file has
 * no import-time dependency on `window`, keeping it safe to import from
 * code paths that also run during server-side prerendering (e.g. via the
 * feature's shared barrel).
 */
export function ReverseGeocodePopup({ point, onClose }: ReverseGeocodePopupProps) {
  const markerRef = useRef<LeafletMarkerInstance>(null)
  const [icon, setIcon] = useState<DivIcon | null>(null)
  const { data, isLoading, isError, error, refetch } = useReverseGeocode(point)
  const map = useMap()

  /** Moves focus to the map container so dismissal never strands focus on `<body>`. */
  const dismiss = useCallback(() => {
    map.getContainer().focus()
    onClose()
  }, [map, onClose])

  useEffect(() => {
    let cancelled = false
    void import("leaflet").then(({ default: L }) => {
      if (!cancelled) {
        setIcon(
          L.divIcon({
            className: "spatialmind-reverse-geocode-marker",
            html: ICON_SVG,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          })
        )
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        dismiss()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [dismiss])

  const markerLabel = isLoading
    ? "Looking up address"
    : data
      ? `Address: ${data.displayName}`
      : "No address found"

  useEffect(() => {
    const element = markerRef.current?.getElement()
    element?.setAttribute("aria-label", markerLabel)
  }, [markerLabel])

  if (!icon) {
    return null
  }

  return (
    <Marker ref={markerRef} position={[point.lat, point.lng]} icon={icon}>
      <Popup
        closeButton={false}
        autoClose={false}
        closeOnClick={false}
        closeOnEscapeKey={false}
      >
        <div className="flex min-w-50 flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">Address details</span>
            <button
              type="button"
              aria-label="Close address details"
              onClick={dismiss}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {isLoading && <SearchLoading label="Looking up address" />}
          {!isLoading && isError && error && (
            <SearchErrorState error={error} onRetry={() => void refetch()} />
          )}
          {!isLoading && !isError && data === null && <SearchEmptyState variant="no-results" />}
          {!isLoading && !isError && data && <p className="text-sm">{data.displayName}</p>}
        </div>
      </Popup>
    </Marker>
  )
}
