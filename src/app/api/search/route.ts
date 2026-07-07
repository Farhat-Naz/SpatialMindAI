import { NextResponse, type NextRequest } from "next/server"
import { getGeocodingProvider } from "@/features/search/api/getGeocodingProvider"
import { checkLimit, getCached, setCached } from "@/features/search/api/rateLimiter"
import { searchQuerySchema } from "@/features/search/api/schemas"
import { parseOrError } from "@/features/search/api/validateRequest"
import type { SearchResult } from "@/features/search/types/search.types"
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
 * `GET /api/search?q=...&limit=...` — the only Route Handler permitted to
 * reach the geocoding provider for place-name search. Validates input,
 * enforces the shared rate limit/cache, then delegates to the active
 * `GeocodingProvider`.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const startedAt = Date.now()
  const { searchParams } = new URL(request.url)

  const parsed = parseOrError(
    searchQuerySchema,
    {
      q: searchParams.get("q") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    },
    "INVALID_QUERY"
  )

  if (!parsed.success) {
    return respond(request, startedAt, 400, { error: parsed.error })
  }

  const { q, limit } = parsed.data
  const cacheKey = `search:${q}:${limit}`
  const cached = getCached<SearchResult[]>(cacheKey)
  if (cached !== undefined) {
    return respond(request, startedAt, 200, { results: cached })
  }

  if (!checkLimit()) {
    return respond(request, startedAt, 429, {
      error: { code: "RATE_LIMITED", message: "Too many searches — please wait a moment" },
    })
  }

  try {
    const results = await getGeocodingProvider().search(q, limit)
    setCached(cacheKey, results)
    return respond(request, startedAt, 200, { results })
  } catch {
    return respond(request, startedAt, 502, {
      error: { code: "PROVIDER_UNAVAILABLE", message: "Search is temporarily unavailable" },
    })
  }
}
