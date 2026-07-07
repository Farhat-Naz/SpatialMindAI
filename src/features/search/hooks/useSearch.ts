"use client"

import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/features/search/services/queryKeys"
import { search, SearchServiceError } from "@/features/search/services/searchService"
import type { SearchApiError, SearchResult } from "@/features/search/types/search.types"

const MIN_QUERY_LENGTH = 2
const DEFAULT_LIMIT = 8
const STALE_TIME_MS = 30_000
const MAX_RETRIES = 2

function shouldRetry(failureCount: number, error: SearchServiceError): boolean {
  if (failureCount >= MAX_RETRIES) {
    return false
  }
  return error.code === "PROVIDER_UNAVAILABLE"
}

function retryDelay(attemptIndex: number): number {
  return Math.min(1000 * 2 ** attemptIndex, 30_000)
}

interface UseSearchResult {
  data: SearchResult[] | undefined
  isLoading: boolean
  isError: boolean
  error: SearchApiError | null
  refetch: () => void
}

/**
 * React Query hook resolving a place-search query to ranked `SearchResult`s.
 * Callers must pass an already-debounced `query`; this hook performs no
 * debouncing of its own. Never retries `4xx`-mapped errors; retries
 * `PROVIDER_UNAVAILABLE` up to twice with exponential backoff.
 */
export function useSearch(query: string, limit: number = DEFAULT_LIMIT): UseSearchResult {
  const trimmed = query.trim()

  const { data, isLoading, isError, error, refetch } = useQuery<
    SearchResult[],
    SearchServiceError
  >({
    queryKey: queryKeys.search(trimmed, limit),
    queryFn: () => search(trimmed, limit),
    enabled: trimmed.length >= MIN_QUERY_LENGTH,
    staleTime: STALE_TIME_MS,
    retry: shouldRetry,
    retryDelay,
  })

  return {
    data,
    isLoading,
    isError,
    error: error ?? null,
    refetch: () => {
      void refetch()
    },
  }
}
