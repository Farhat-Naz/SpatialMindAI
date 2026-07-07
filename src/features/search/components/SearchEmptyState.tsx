interface SearchEmptyStateProps {
  variant: "no-results" | "start-typing"
  /** Only meaningful for `"no-results"`; echoed in the message when provided. */
  query?: string
}

/** Stateless "no results" / "start typing" placeholder shown in the results list. */
export function SearchEmptyState({ variant, query }: SearchEmptyStateProps) {
  const message =
    variant === "start-typing"
      ? "Start typing to search for a place"
      : query
        ? `No results found for "${query}"`
        : "No results found"

  return <div className="px-3 py-6 text-center text-sm text-muted-foreground">{message}</div>
}
