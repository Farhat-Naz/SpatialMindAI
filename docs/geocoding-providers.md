# Geocoding Providers

Geocoding access is isolated behind a single interface so the active
provider can be swapped without touching Route Handlers, services, hooks, or
components.

## The `GeocodingProvider` interface

Defined in `src/features/search/api/provider.types.ts`:

```ts
interface GeocodingProvider {
  search(query: string, limit: number): Promise<SearchResult[]>
  reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null>
}
```

- **Default provider**: `NominatimProvider`
  (`src/features/search/api/nominatimProvider.ts`) — calls OpenStreetMap's
  Nominatim `/search` and `/reverse` endpoints, sets the required
  `User-Agent` header, and maps Nominatim's response shape into
  `SearchResult`/`ReverseGeocodeResult`.
- **Selection point**: `getGeocodingProvider()`
  (`src/features/search/api/getGeocodingProvider.ts`) — called only from the
  two Route Handlers (`app/api/search/route.ts`,
  `app/api/reverse-geocode/route.ts`).

## Adding a new provider

1. Create `src/features/search/api/<name>Provider.ts` implementing
   `GeocodingProvider`. Keep provider-specific concerns (API keys,
   rate-limit shape, response mapping) entirely inside this file.
2. Read any required credential from `process.env` at module scope (same
   pattern as `config.ts`) — never per-request, never hardcoded.
3. Map the provider's response shape into `SearchResult`/
   `ReverseGeocodeResult` exactly (see `data-model.md` in
   `specs/002-search/` for field-level constraints).
4. Update `getGeocodingProvider.ts` to return the new provider instance
   (e.g., behind an env-based switch) instead of `NominatimProvider`.
5. No other file needs to change: Route Handlers, `searchService.ts`,
   `reverseGeocodeService.ts`, hooks, and components all depend only on the
   `GeocodingProvider` interface and the fixed `SearchResult`/
   `ReverseGeocodeResult` shapes.

## Candidate future providers

Not built this phase, but the interface already accommodates them:
`ArcGISProvider`, `GooglePlacesProvider`, `MapboxProvider`.
