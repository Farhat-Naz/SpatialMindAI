import type { ReverseGeocodeResult, SearchResult } from "@/features/search/types/search.types"

/**
 * Server-only contract for a geocoding backend. Implementations are called
 * exclusively from `getGeocodingProvider()` and the Route Handlers — never
 * from client code — per Constitution Principle V (API Architecture).
 */
export interface GeocodingProvider {
  /** Resolve free-text place-name queries into ranked candidate results. */
  search(query: string, limit: number): Promise<SearchResult[]>
  /** Resolve a coordinate pair into the best-available address, or null if none. */
  reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null>
}
