# Search feature

Keyboard-accessible place search (type-ahead suggestions, map `flyTo`
navigation, marker placement, locally-persisted recent searches) and
map-click reverse geocoding. All geocoding calls are proxied server-side
through two Route Handlers (`GET /api/search`, `GET /api/reverse-geocode`)
that call Nominatim (OpenStreetMap) — no third-party host is ever reachable
from the browser.

## Public API

Only two components are exported from this feature's barrel
(`src/features/search/index.ts`); everything else (hooks, store, services,
other components) is private to the feature.

```ts
import { SearchBox, ReverseGeocodePopup } from "@/features/search"
```

- **`SearchBox`** — the search input + suggestions dropdown. Mounted once in
  the dashboard `Toolbar`. Owns no external state via props; reads/writes the
  feature's Zustand store directly.
- **`ReverseGeocodePopup`** — the map-click popup showing the resolved
  address for a clicked coordinate. Mounted inside `MapCore`, bound to
  `searchStore.reverseGeocodePoint`. Code-split via `next/dynamic` in the
  barrel so its `react-leaflet`/`leaflet` dependency never reaches
  server-rendered code paths (see `index.ts`).

## Usage example

```tsx
// features/dashboard/components/Toolbar.tsx
import { SearchBox } from "@/features/search"

export function Toolbar() {
  return (
    <nav aria-label="Toolbar">
      <SearchBox />
    </nav>
  )
}
```

```tsx
// features/map/components/MapCore.tsx
import { ReverseGeocodePopup } from "@/features/search"
import { useSearchStore } from "@/features/search/store/searchStore" // internal, same feature only

const point = useSearchStore((s) => s.reverseGeocodePoint)
const setPoint = useSearchStore((s) => s.setReverseGeocodePoint)

{point && <ReverseGeocodePopup point={point} onClose={() => setPoint(null)} />}
```

## Architecture

- `api/` — server-only: `provider.types.ts` (the `GeocodingProvider`
  interface), `nominatimProvider.ts` (default implementation),
  `getGeocodingProvider.ts` (the single factory/swap point), `schemas.ts` +
  `validateRequest.ts` (Zod validation), `config.ts` (env-driven config),
  `rateLimiter.ts` (sliding-window limiter + short-TTL cache). Only this
  factory and the two Route Handlers may import `nominatimProvider.ts`
  directly.
- `services/` — client-side fetch wrappers (`searchService.ts`,
  `reverseGeocodeService.ts`) and the centralized React Query key factory
  (`queryKeys.ts`).
- `hooks/` — `useSearch`, `useReverseGeocode` (React Query), `useSearchHistory`
  (Zustand accessor), `useMapSearchIntegration` (Leaflet glue: `flyTo` +
  marker + map-click wiring).
- `store/searchStore.ts` — the only mutation path for query text,
  dropdown/highlight state, the single active selection (search result XOR
  reverse-geocode point), and the persisted recent-searches list.
- `components/` — presentational components; see
  `specs/002-search/contracts/component-api.md` for prop shapes.

## Known limitations

- **Rate limiter is single-instance, in-memory.** `rateLimiter.ts` enforces
  Nominatim's ~1 request/second usage policy with a per-process sliding
  window and a short-TTL cache. This is correct for a single Next.js server
  instance; scaling to multiple instances/regions would require moving this
  state to a shared store (e.g. Redis) to remain effective.
- Nominatim is the only implemented provider this phase. `GeocodingProvider`
  is designed to support future providers (ArcGIS, Google Places, Mapbox) —
  see `docs/geocoding-providers.md`.
