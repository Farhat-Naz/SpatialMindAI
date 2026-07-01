import { useRef } from "react"
import { useMapEvents } from "react-leaflet"
import { useMapStore } from "@/features/map/store/mapStore"
import type { LatLng } from "@/shared/types/common.types"

const THROTTLE_MS = 16

export function useCoordinates() {
  const mapStatus = useMapStore((s) => s.mapStatus)
  const lastKnownCoords = useMapStore((s) => s.lastKnownCoords)
  const setLastKnownCoords = useMapStore((s) => s.setLastKnownCoords)
  const lastCallRef = useRef<number>(0)

  const isReady = mapStatus === "ready"

  useMapEvents({
    mousemove(e) {
      const now = Date.now()
      if (now - lastCallRef.current < THROTTLE_MS) return
      lastCallRef.current = now
      const coords: LatLng = { lat: e.latlng.lat, lng: e.latlng.lng }
      setLastKnownCoords(coords)
    },
  })

  const showCoords = isReady && lastKnownCoords !== null

  return {
    coords: lastKnownCoords,
    formattedLat: showCoords ? lastKnownCoords!.lat.toFixed(4) : "—",
    formattedLng: showCoords ? lastKnownCoords!.lng.toFixed(4) : "—",
    isReady,
  }
}
