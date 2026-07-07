import type { SearchApiError, SearchResult } from "@/features/search/types/search.types"

interface SearchApiSuccessBody {
  results: SearchResult[]
}

interface SearchApiErrorBody {
  error: SearchApiError
}

const UNAVAILABLE_ERROR: SearchApiError = {
  code: "PROVIDER_UNAVAILABLE",
  message: "Search is temporarily unavailable",
}

/** Typed error thrown by `search()`, preserving the Route Handler's `code`/`message`. */
export class SearchServiceError extends Error implements SearchApiError {
  code: SearchApiError["code"]

  constructor(error: SearchApiError) {
    super(error.message)
    this.name = "SearchServiceError"
    this.code = error.code
  }
}

/**
 * Fetches place-search results from `GET /api/search` — the only module
 * permitted to call that endpoint directly. Throws a `SearchServiceError`
 * (a typed `SearchApiError`) on any non-2xx response or network failure.
 */
export async function search(query: string, limit?: number): Promise<SearchResult[]> {
  const params = new URLSearchParams({ q: query })
  if (limit !== undefined) {
    params.set("limit", String(limit))
  }

  let response: Response
  try {
    response = await fetch(`/api/search?${params.toString()}`)
  } catch {
    throw new SearchServiceError(UNAVAILABLE_ERROR)
  }

  const body = (await response.json()) as SearchApiSuccessBody | SearchApiErrorBody

  if (!response.ok || "error" in body) {
    throw new SearchServiceError("error" in body ? body.error : UNAVAILABLE_ERROR)
  }

  return body.results
}
