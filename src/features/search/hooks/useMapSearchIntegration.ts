"use client"

import { useEffect, useRef } from "react"
import { useMap, useMapEvents } from "react-leaflet"
import { useSearchStore } from "@/features/search/store/searchStore"
import { useMapStore } from "@/features/map/store/mapStore"

const FLY_TO_ZOOM = 16

/**
 * Glue hook mounted once inside `MapCore`'s `MapContainer`: drives
 * `map.flyTo()` from `searchStore.selectedLocation` (US3), syncs
 * `mapStore.center`/`zoom` once the animation settles (FR-026), and handles
 * map clicks by setting `searchStore.reverseGeocodePoint` (US5) — ignored
 * while a flyTo is still in progress. Returns nothing; it is pure glue.
 */
export function useMapSearchIntegration(): void {
  const map = useMap()
  const isFlyingRef = useRef(false)

  const selectedLocation = useSearchStore((s) => s.selectedLocation)
  const setReverseGeocodePoint = useSearchStore((s) => s.setReverseGeocodePoint)
  const setCenter = useMapStore((s) => s.setCenter)
  const setZoom = useMapStore((s) => s.setZoom)

  useEffect(() => {
    if (selectedLocation) {
      map.flyTo([selectedLocation.lat, selectedLocation.lng], FLY_TO_ZOOM)
    }
  }, [selectedLocation, map])

  useMapEvents({
    movestart() {
      isFlyingRef.current = true
    },
    moveend() {
      isFlyingRef.current = false
      const center = map.getCenter()
      setCenter({ lat: center.lat, lng: center.lng })
      setZoom(map.getZoom())
    },
    click(event) {
      if (isFlyingRef.current) {
        return
      }
      setReverseGeocodePoint({ lat: event.latlng.lat, lng: event.latlng.lng })
    },
  })
}
