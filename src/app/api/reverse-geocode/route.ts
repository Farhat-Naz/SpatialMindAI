import { NextResponse, type NextRequest } from "next/server"
import { getGeocodingProvider } from "@/features/search/api/getGeocodingProvider"
import { checkLimit, getCached, setCached } from "@/features/search/api/rateLimiter"
import { reverseGeocodeQuerySchema } from "@/features/search/api/schemas"
import { parseOrError } from "@/features/search/api/validateRequest"
import type { ReverseGeocodeResult } from "@/features/search/types/search.types"
import { logger } from "@/shared/lib/logger"

function respond(request: NextRequest, startedAt: number, status: number, body: unknown): NextResponse {
  logger.request({
    method: request.method,
    path: new URL(request.url).pathname,
    status,
    durationMs: Date.now() - startedAt,
  })
  return NextResponse.json(body, { status })
}

/**
 * `GET /api/reverse-geocode?lat=...&lng=...` — the only Route Handler
 * permitted to reach the geocoding provider for reverse geocoding. Shares
 * the same rate limiter/cache module and error-mapping shape as
 * `GET /api/search`.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const startedAt = Date.now()
  const { searchParams } = new URL(request.url)

  const parsed = parseOrError(
    reverseGeocodeQuerySchema,
    {
      lat: searchParams.get("lat") ?? undefined,
      lng: searchParams.get("lng") ?? undefined,
    },
    "INVALID_COORDINATES"
  )

  if (!parsed.success) {
    return respond(request, startedAt, 400, { error: parsed.error })
  }

  const { lat, lng } = parsed.data
  const cacheKey = `reverseGeocode:${lat}:${lng}`
  const cached = getCached<ReverseGeocodeResult | null>(cacheKey)
  if (cached !== undefined) {
    return respond(request, startedAt, 200, { result: cached })
  }

  if (!checkLimit()) {
    return respond(request, startedAt, 429, {
      error: { code: "RATE_LIMITED", message: "Too many requests — please wait a moment" },
    })
  }

  try {
    const result = await getGeocodingProvider().reverseGeocode(lat, lng)
    setCached(cacheKey, result)
    return respond(request, startedAt, 200, { result })
  } catch {
    return respond(request, startedAt, 502, {
      error: { code: "PROVIDER_UNAVAILABLE", message: "Reverse geocoding is temporarily unavailable" },
    })
  }
}
