# Environment Variables

## Search feature (Phase 2)

All three are optional — the search feature works with no `.env` file at all,
falling back to the defaults below. See `.env.example` for the same list with
inline comments.

| Variable | Default | Description |
|---|---|---|
| `NOMINATIM_BASE_URL` | `https://nominatim.openstreetmap.org` | Base URL of the Nominatim-compatible geocoding service the Route Handlers call server-side. |
| `SEARCH_USER_AGENT` | `SpatialMindAI/1.0 (contact: support@spatialmind.ai)` | Required by Nominatim's usage policy: a custom, application-identifying `User-Agent` sent on every outbound request. **Set this to your own deployment's contact info before going to production.** |
| `SEARCH_RATE_LIMIT_PER_SECOND` | `1` | Maximum outbound requests per second to the geocoding provider, enforced by the local in-memory rate limiter (`src/features/search/api/rateLimiter.ts`). Matches Nominatim's ~1 req/s usage policy. |

None of these are secrets — Nominatim is keyless. If a future provider
(ArcGIS, Google Places, Mapbox — see `docs/geocoding-providers.md`) is added,
its API key must be read the same way (`process.env`, module-scope, never
committed) but declared in that provider's own module, not `config.ts`.

Read once at module scope in `src/features/search/api/config.ts` — never
re-read per request.
