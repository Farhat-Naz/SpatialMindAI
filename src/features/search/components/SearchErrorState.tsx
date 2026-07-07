import { Button } from "@/shared/components/ui/button"
import type { SearchApiError } from "@/features/search/types/search.types"

interface SearchErrorStateProps {
  error: SearchApiError
  onRetry: () => void
}

/** Renders a typed API error's message plus a Retry action; `RATE_LIMITED` gets distinct copy. */
export function SearchErrorState({ error, onRetry }: SearchErrorStateProps) {
  const message =
    error.code === "RATE_LIMITED"
      ? "Too many searches — please wait a moment"
      : error.message

  return (
    <div className="flex flex-col items-center gap-2 px-3 py-6 text-center text-sm">
      <p className="text-muted-foreground">{message}</p>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}
