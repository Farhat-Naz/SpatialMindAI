import { searchConfig } from "@/features/search/api/config"

/** Short-TTL cache absorbs bursts of identical queries without hitting the limiter. */
const CACHE_TTL_MS = 5_000
const WINDOW_MS = 1_000

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

/** Per-process, in-memory sliding window — documented single-instance limitation. */
let requestTimestamps: number[] = []
const cache = new Map<string, CacheEntry<unknown>>()

/**
 * Returns `true` if the request is within Nominatim's ~1 req/s budget (and
 * records it), or `false` if the caller must back off. Shared by both the
 * search and reverse-geocode Route Handlers so they draw from one budget.
 */
export function checkLimit(): boolean {
  const now = Date.now()
  const windowStart = now - WINDOW_MS
  requestTimestamps = requestTimestamps.filter((timestamp) => timestamp > windowStart)

  if (requestTimestamps.length >= searchConfig.rateLimitPerSecond) {
    return false
  }

  requestTimestamps.push(now)
  return true
}

/** Returns a still-fresh cached value for `key`, or `undefined` on a miss/expiry. */
export function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key)
  if (!entry) {
    return undefined
  }

  if (entry.expiresAt <= Date.now()) {
    cache.delete(key)
    return undefined
  }

  return entry.value as T
}

/** Stores `value` under `key` for a short, fixed TTL to avoid stale duplicate results. */
export function setCached<T>(key: string, value: T): void {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS })
}
