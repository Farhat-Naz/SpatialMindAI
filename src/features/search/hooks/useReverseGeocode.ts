"use client"

import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/features/search/services/queryKeys"
import {
  reverseGeocode,
  ReverseGeocodeServiceError,
} from "@/features/search/services/reverseGeocodeService"
import type { ReverseGeocodeResult, SearchApiError } from "@/features/search/types/search.types"
import type { LatLng } from "@/shared/types/common.types"

const STALE_TIME_MS = 300_000
const MAX_RETRIES = 2

function shouldRetry(failureCount: number, error: ReverseGeocodeServiceError): boolean {
  if (failureCount >= MAX_RETRIES) {
    return false
  }
  return error.code === "PROVIDER_UNAVAILABLE"
}

function retryDelay(attemptIndex: number): number {
  return Math.min(1000 * 2 ** attemptIndex, 30_000)
}

interface UseReverseGeocodeResult {
  data: ReverseGeocodeResult | null | undefined
  isLoading: boolean
  isError: boolean
  error: SearchApiError | null
  refetch: () => void
}

/**
 * React Query hook resolving a clicked map coordinate to its best-available
 * address. `data === null` means the point resolved with no address found;
 * `data === undefined` means it hasn't resolved yet. Retry semantics match
 * `useSearch`: never retries `4xx`-mapped errors, retries
 * `PROVIDER_UNAVAILABLE` up to twice with the same exponential backoff.
 */
export function useReverseGeocode(point: LatLng | null): UseReverseGeocodeResult {
  const { data, isLoading, isError, error, refetch } = useQuery<
    ReverseGeocodeResult | null,
    ReverseGeocodeServiceError
  >({
    queryKey: queryKeys.reverseGeocode(point?.lat ?? 0, point?.lng ?? 0),
    queryFn: () => reverseGeocode(point!.lat, point!.lng),
    enabled: point !== null,
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
