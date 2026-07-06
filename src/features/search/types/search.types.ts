/** A single place-search result returned by the active geocoding provider. */
export interface SearchResult {
  /** Stable identifier for the result, as provided by the geocoding provider */
  id: string
  /** Human-readable label shown in the results list */
  displayName: string
  /** Latitude in decimal degrees */
  lat: number
  /** Longitude in decimal degrees */
  lng: number
  /**
   * Optional bounding box [south, west, north, east] for area-type results;
   * informational only — navigation always uses the fixed zoom level (FR-019),
   * not this bounding box.
   */
  boundingBox?: [number, number, number, number]
  /** Optional place category/type (e.g., "city", "restaurant", "landmark") */
  category?: string
  /** Optional provider-supplied relevance score, higher is more relevant */
  importance?: number
}

/** A previously selected search result, retained for one-click recall. */
export interface RecentSearch {
  /** Unique identifier for this recent-search entry */
  id: string
  /** The original query text the user typed */
  query: string
  /** The search result the user selected for this entry */
  result: SearchResult
  /** ISO 8601 timestamp of when this entry was last selected/re-selected */
  searchedAt: string
}

/** The best-available address/place description for a clicked map coordinate. */
export interface ReverseGeocodeResult {
  /** Human-readable label for the resolved location */
  displayName: string
  /** Latitude in decimal degrees (echoes or resolves the queried point) */
  lat: number
  /** Longitude in decimal degrees (echoes or resolves the queried point) */
  lng: number
  /** Structured address components, when available from the provider */
  address?: {
    road?: string
    city?: string
    state?: string
    country?: string
    postalCode?: string
  }
}

/** Typed error envelope returned by the search/reverse-geocode Route Handlers. */
export interface SearchApiError {
  code:
    | "INVALID_QUERY"
    | "INVALID_COORDINATES"
    | "PROVIDER_UNAVAILABLE"
    | "RATE_LIMITED"
  message: string
}
