import { NominatimProvider } from "@/features/search/api/nominatimProvider"
import type { GeocodingProvider } from "@/features/search/api/provider.types"

const activeProvider: GeocodingProvider = new NominatimProvider()

/**
 * Single factory/swap point for the active `GeocodingProvider`. Only this
 * file and the Route Handlers may import `nominatimProvider.ts` directly —
 * services, hooks, and components must go through this factory instead.
 */
export function getGeocodingProvider(): GeocodingProvider {
  return activeProvider
}
