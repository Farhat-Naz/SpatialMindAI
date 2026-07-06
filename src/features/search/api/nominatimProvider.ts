import { searchConfig } from "@/features/search/api/config"
import type { GeocodingProvider } from "@/features/search/api/provider.types"
import type { ReverseGeocodeResult, SearchResult } from "@/features/search/types/search.types"

/** Raw shape of a single Nominatim `/search` result (subset of fields we use). */
interface NominatimSearchResultRaw {
  place_id: number
  display_name: string
  lat: string
  lon: string
  boundingbox?: [string, string, string, string]
  type?: string
  importance?: number
}

/** Raw shape of a Nominatim `/reverse` response (subset of fields we use). */
interface NominatimReverseResultRaw {
  display_name: string
  lat: string
  lon: string
  address?: {
    road?: string
    city?: string
    town?: string
    village?: string
    state?: string
    country?: string
    postcode?: string
  }
}

/** Nominatim returns `{ error: "..." }` (200) when a reverse point has no address. */
interface NominatimErrorBody {
  error?: string
}

/**
 * Issues a single request to the configured Nominatim instance with the
 * required User-Agent header. Shared by both `search()` and
 * `reverseGeocode()` so HTTP request setup is defined exactly once.
 */
async function nominatimFetch(
  path: "/search" | "/reverse",
  params: Record<string, string>
): Promise<unknown> {
  const url = new URL(path, searchConfig.nominatimBaseUrl)
  url.searchParams.set("format", "jsonv2")
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  const response = await fetch(url, {
    headers: { "User-Agent": searchConfig.userAgent },
  })

  if (!response.ok) {
    throw new Error(`Nominatim request failed with status ${response.status}`)
  }

  return response.json() as Promise<unknown>
}

function mapSearchResult(raw: NominatimSearchResultRaw): SearchResult {
  const result: SearchResult = {
    id: String(raw.place_id),
    displayName: raw.display_name,
    lat: Number(raw.lat),
    lng: Number(raw.lon),
  }

  if (raw.boundingbox) {
    const [south, north, west, east] = raw.boundingbox
    result.boundingBox = [Number(south), Number(west), Number(north), Number(east)]
  }

  if (raw.type) {
    result.category = raw.type
  }

  if (typeof raw.importance === "number") {
    result.importance = raw.importance
  }

  return result
}

function mapReverseGeocodeResult(raw: NominatimReverseResultRaw): ReverseGeocodeResult {
  const result: ReverseGeocodeResult = {
    displayName: raw.display_name,
    lat: Number(raw.lat),
    lng: Number(raw.lon),
  }

  const rawAddress = raw.address
  if (rawAddress) {
    result.address = {
      road: rawAddress.road,
      city: rawAddress.city ?? rawAddress.town ?? rawAddress.village,
      state: rawAddress.state,
      country: rawAddress.country,
      postalCode: rawAddress.postcode,
    }
  }

  return result
}

/**
 * Default `GeocodingProvider` implementation, calling OpenStreetMap's
 * Nominatim `/search` and `/reverse` endpoints. Selected via
 * `getGeocodingProvider()` — never imported directly outside this module and
 * the provider factory.
 */
export class NominatimProvider implements GeocodingProvider {
  async search(query: string, limit: number): Promise<SearchResult[]> {
    const raw = (await nominatimFetch("/search", {
      q: query,
      limit: String(limit),
    })) as NominatimSearchResultRaw[]

    return raw.map(mapSearchResult)
  }

  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
    const raw = (await nominatimFetch("/reverse", {
      lat: String(lat),
      lon: String(lng),
    })) as NominatimReverseResultRaw & NominatimErrorBody

    if (!raw.display_name) {
      return null
    }

    return mapReverseGeocodeResult(raw)
  }
}
