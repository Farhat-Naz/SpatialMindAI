"use client"

import dynamic from "next/dynamic"
import { cn } from "@/shared/lib/utils"
import { useMapStatus } from "@/features/map/hooks/useMapStatus"
import { MapLoadingOverlay } from "@/features/map/components/MapLoadingOverlay"
import { MapErrorOverlay } from "@/features/map/components/MapErrorOverlay"

const DynamicMapCore = dynamic(
  () => import("./MapCore").then((mod) => ({ default: mod.MapCore })),
  { ssr: false }
)

interface MapContainerProps {
  className?: string
}

export function MapContainer({ className }: MapContainerProps) {
  const { isLoading, isError, errorMessage, retry } = useMapStatus()

  return (
    <div className={cn("relative", className)}>
      <DynamicMapCore />
      <MapLoadingOverlay visible={isLoading} />
      <MapErrorOverlay
        visible={isError}
        message={errorMessage}
        onRetry={retry}
      />
    </div>
  )
}
