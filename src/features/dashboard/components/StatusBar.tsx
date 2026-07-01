"use client"

import { useMapStore } from "@/features/map/store/mapStore"
import { formatLatLng } from "@/shared/lib/utils"

interface StatusBarProps {
  children?: React.ReactNode
}

export function StatusBar({ children }: StatusBarProps) {
  const mapStatus = useMapStore((s) => s.mapStatus)
  const lastKnownCoords = useMapStore((s) => s.lastKnownCoords)
  const zoom = useMapStore((s) => s.zoom)

  const coordDisplay =
    mapStatus === "ready" ? formatLatLng(lastKnownCoords) : "—"

  return (
    <footer className="flex items-center justify-between border-t bg-background px-3 py-1 text-xs text-muted-foreground">
      <span aria-live="polite">{coordDisplay}</span>
      <span>Zoom: {zoom}</span>
      {children}
    </footer>
  )
}
