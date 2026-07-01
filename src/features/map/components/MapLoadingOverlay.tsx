import { LoadingSpinner } from "@/shared/components/LoadingSpinner"

interface MapLoadingOverlayProps {
  visible: boolean
}

export function MapLoadingOverlay({ visible }: MapLoadingOverlayProps) {
  if (!visible) return null

  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-background/50"
      role="status"
      aria-label="Map loading"
    >
      <LoadingSpinner size="lg" label="Map loading" />
    </div>
  )
}
