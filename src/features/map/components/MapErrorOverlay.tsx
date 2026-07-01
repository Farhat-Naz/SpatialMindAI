import { AlertCircle } from "lucide-react"
import { Button } from "@/shared/components/ui/button"

interface MapErrorOverlayProps {
  visible: boolean
  message: string | null
  onRetry: () => void
}

export function MapErrorOverlay({ visible, message, onRetry }: MapErrorOverlayProps) {
  if (!visible) return null

  const displayMessage = message || "Failed to load map."

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/80"
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="h-10 w-10 text-destructive" aria-hidden="true" />
      <p className="text-sm text-foreground">{displayMessage}</p>
      <Button onClick={onRetry}>Retry</Button>
    </div>
  )
}
