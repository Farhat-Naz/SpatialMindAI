import { Loader2 } from "lucide-react"

interface SearchLoadingProps {
  /** Accessible label describing what is loading, e.g. "Searching places" */
  label: string
}

/** Shared, stateless loading indicator reused by search and reverse-geocode loading states. */
export function SearchLoading({ label }: SearchLoadingProps) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}
