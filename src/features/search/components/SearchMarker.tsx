"use client"

import { useEffect, useState } from "react"
import { Marker } from "react-leaflet"
import type { DivIcon } from "leaflet"
import { useSearchStore } from "@/features/search/store/searchStore"

const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-primary,#2563eb)"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`

/**
 * Renders a marker at `searchStore.selectedLocation`, or nothing when null.
 * A single `Marker` instance is reused across selections — Leaflet updates
 * its position in place, so at most one search marker ever exists (T072).
 * `leaflet` is loaded lazily on mount (not at module scope) so this file has
 * no import-time dependency on `window`, keeping it safe to import from
 * code paths that also run during server-side prerendering (e.g. via the
 * feature's shared barrel).
 */
export function SearchMarker() {
  const selectedLocation = useSearchStore((s) => s.selectedLocation)
  const [icon, setIcon] = useState<DivIcon | null>(null)

  useEffect(() => {
    let cancelled = false
    void import("leaflet").then(({ default: L }) => {
      if (!cancelled) {
        setIcon(
          L.divIcon({
            className: "spatialmind-search-marker",
            html: ICON_SVG,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          })
        )
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!selectedLocation || !icon) {
    return null
  }

  return (
    <Marker
      position={[selectedLocation.lat, selectedLocation.lng]}
      icon={icon}
      alt={selectedLocation.displayName}
    />
  )
}
