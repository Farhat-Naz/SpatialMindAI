/** Default Nominatim public instance — no API key required. */
const DEFAULT_NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org"

/** Nominatim's usage policy requires a custom, application-identifying User-Agent. */
const DEFAULT_SEARCH_USER_AGENT = "SpatialMindAI/1.0 (contact: support@spatialmind.ai)"

/** Nominatim's usage policy caps unauthenticated usage at ~1 request/second. */
const DEFAULT_RATE_LIMIT_PER_SECOND = 1

interface SearchConfig {
  nominatimBaseUrl: string
  userAgent: string
  rateLimitPerSecond: number
}

function parseRateLimit(value: string | undefined): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_RATE_LIMIT_PER_SECOND
}

/**
 * Search feature configuration, read once at module scope from environment
 * variables with sensible defaults. Never contains a secret — Nominatim is
 * keyless — but future providers' credentials MUST follow this same
 * server-only, module-scope-read pattern rather than being read per-request.
 */
export const searchConfig: SearchConfig = {
  nominatimBaseUrl: process.env.NOMINATIM_BASE_URL || DEFAULT_NOMINATIM_BASE_URL,
  userAgent: process.env.SEARCH_USER_AGENT || DEFAULT_SEARCH_USER_AGENT,
  rateLimitPerSecond: parseRateLimit(process.env.SEARCH_RATE_LIMIT_PER_SECOND),
}
