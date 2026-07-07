/**
 * Centralized, typed React Query key factory for the search feature — no
 * other module should construct a `['search', ...]`/`['reverseGeocode', ...]`
 * key by hand (Constitution Principle IV).
 */
export const queryKeys = {
  search: (query: string, limit: number) => ["search", query, limit] as const,
  reverseGeocode: (lat: number, lng: number) => ["reverseGeocode", lat, lng] as const,
}
