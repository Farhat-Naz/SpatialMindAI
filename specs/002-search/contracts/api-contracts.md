# API Contracts: Search & Reverse Geocode Route Handlers

**Feature**: 002-search

These are the authoritative request/response contracts for the two Route Handlers
introduced this phase. They mirror `spec.md`'s API Requirements section exactly;
this document exists so downstream `/speckit-tasks` work can reference a stable
contracts path per the standard Spec Kit layout, without duplicating rationale
already captured in `spec.md`/`plan.md`.

---

## `GET /api/search`

**Consumed by**: `features/search/services/searchService.ts` (only caller)
**Calls upstream**: `NominatimProvider.search` via `getGeocodingProvider()`

### Request

| Parameter | Type | Required | Constraint |
|---|---|---|---|
| `q` | string | Yes | Trimmed length ≥ 2 |
| `limit` | number | No | Default 8; server clamps to max 10 |

### Response — 200 OK

```
{
  "results": SearchResult[]
}
```

### Response — Error

| HTTP Status | `code` | When |
|---|---|---|
| 400 | `INVALID_QUERY` | `q` missing, empty after trim, or below minimum length |
| 429 | `RATE_LIMITED` | Local limiter has exceeded the Nominatim-compliant request budget |
| 502 | `PROVIDER_UNAVAILABLE` | Upstream Nominatim error, timeout, or unexpected exception |

```
{
  "error": { "code": string, "message": string }
}
```

---

## `GET /api/reverse-geocode`

**Consumed by**: `features/search/services/reverseGeocodeService.ts` (only caller)
**Calls upstream**: `NominatimProvider.reverseGeocode` via `getGeocodingProvider()`

### Request

| Parameter | Type | Required | Constraint |
|---|---|---|---|
| `lat` | number | Yes | -90..90 |
| `lng` | number | Yes | -180..180 |

### Response — 200 OK

```
{
  "result": ReverseGeocodeResult | null
}
```

`result: null` is a valid, non-error outcome (no address at that point).

### Response — Error

| HTTP Status | `code` | When |
|---|---|---|
| 400 | `INVALID_COORDINATES` | `lat`/`lng` missing or out of range |
| 429 | `RATE_LIMITED` | Local limiter has exceeded the Nominatim-compliant request budget |
| 502 | `PROVIDER_UNAVAILABLE` | Upstream Nominatim error, timeout, or unexpected exception |

```
{
  "error": { "code": string, "message": string }
}
```

---

## Cross-cutting contract rules

- Both handlers validate input with Zod **before** calling `getGeocodingProvider()` —
  an invalid request MUST NOT reach the upstream provider.
- Both handlers MUST set Nominatim's required `User-Agent` header server-side inside
  `NominatimProvider`, never in client code (there is no client code that can reach
  Nominatim directly).
- Neither handler MUST leak an upstream stack trace or raw provider error body in the
  `message` field — `message` is always a handler-authored, user-safe string.
