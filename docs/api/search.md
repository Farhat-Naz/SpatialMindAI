# API: Search & Reverse Geocode

Two Route Handlers proxy geocoding requests to Nominatim (OpenStreetMap)
server-side. The browser never calls Nominatim directly. This document
mirrors `specs/002-search/contracts/api-contracts.md`; keep both in sync if
either changes.

## `GET /api/search`

### Request

| Parameter | Type | Required | Constraint |
|---|---|---|---|
| `q` | string | Yes | Trimmed length ≥ 2 |
| `limit` | number | No | Default 8; clamped to a maximum of 10 |

### Response — 200 OK

```json
{ "results": [
  { "id": "123", "displayName": "Paris, France", "lat": 48.8566, "lng": 2.3522 }
] }
```

### Response — Error

| HTTP Status | `code` | When |
|---|---|---|
| 400 | `INVALID_QUERY` | `q` missing, empty after trim, or below minimum length |
| 429 | `RATE_LIMITED` | Local rate limiter has exceeded the request budget |
| 502 | `PROVIDER_UNAVAILABLE` | Upstream Nominatim error, timeout, or unexpected exception |

```json
{ "error": { "code": "INVALID_QUERY", "message": "Query must be at least 2 characters" } }
```

### Example

```bash
curl "https://<your-deployment>/api/search?q=paris&limit=5"
```

## `GET /api/reverse-geocode`

### Request

| Parameter | Type | Required | Constraint |
|---|---|---|---|
| `lat` | number | Yes | -90..90 |
| `lng` | number | Yes | -180..180 |

### Response — 200 OK

```json
{ "result": { "displayName": "1 Rue de Rivoli, Paris", "lat": 48.8566, "lng": 2.3522,
  "address": { "road": "Rue de Rivoli", "city": "Paris", "country": "France", "postalCode": "75001" } } }
```

`result: null` is a **valid, non-error** outcome (no address at that point) — always `200`, never a `4xx`/`5xx`.

### Response — Error

| HTTP Status | `code` | When |
|---|---|---|
| 400 | `INVALID_COORDINATES` | `lat`/`lng` missing or out of range |
| 429 | `RATE_LIMITED` | Local rate limiter has exceeded the request budget |
| 502 | `PROVIDER_UNAVAILABLE` | Upstream Nominatim error, timeout, or unexpected exception |

```json
{ "error": { "code": "INVALID_COORDINATES", "message": "..." } }
```

### Example

```bash
curl "https://<your-deployment>/api/reverse-geocode?lat=48.8566&lng=2.3522"
```

## Cross-cutting rules

- Both handlers validate input with Zod **before** calling the geocoding
  provider — an invalid request never reaches Nominatim.
- Both handlers set Nominatim's required `User-Agent` header server-side
  (inside `NominatimProvider`); there is no client code that can reach
  Nominatim directly.
- Neither handler ever returns a raw upstream stack trace or provider error
  body — `message` is always a handler-authored, user-safe string.
- Search and reverse-geocode share the same in-memory rate-limit budget
  (~1 request/second, per Nominatim's usage policy).
