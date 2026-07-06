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
    <footer className="flex items-center justify-between gap-2 overflow-hidden border-t bg-background px-3 py-1 text-xs text-muted-foreground">
      <span className="min-w-0 truncate" aria-live="polite">
        {coordDisplay}
      </span>
      <span className="shrink-0">Zoom: {zoom}</span>
      {children}
    </footer>
  )
}
