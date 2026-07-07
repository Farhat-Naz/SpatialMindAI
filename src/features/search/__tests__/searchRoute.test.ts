import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"

vi.mock("@/features/search/api/getGeocodingProvider", () => ({
  getGeocodingProvider: vi.fn(),
}))
vi.mock("@/features/search/api/rateLimiter", () => ({
  checkLimit: vi.fn(),
  getCached: vi.fn(),
  setCached: vi.fn(),
}))
vi.mock("@/shared/lib/logger", () => ({
  logger: { request: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

import { GET } from "../../../app/api/search/route"
import { getGeocodingProvider } from "@/features/search/api/getGeocodingProvider"
import { checkLimit, getCached, setCached } from "@/features/search/api/rateLimiter"

function makeRequest(query: string): NextRequest {
  return new NextRequest(`http://localhost/api/search${query}`)
}

describe("GET /api/search", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getCached).mockReturnValue(undefined)
    vi.mocked(checkLimit).mockReturnValue(true)
  })

  it("returns 200 with results on a valid request", async () => {
    const results = [{ id: "1", displayName: "Paris", lat: 48.85, lng: 2.35 }]
    vi.mocked(getGeocodingProvider).mockReturnValue({
      search: vi.fn().mockResolvedValue(results),
      reverseGeocode: vi.fn(),
    })

    const response = await GET(makeRequest("?q=paris"))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ results })
    expect(setCached).toHaveBeenCalledWith("search:paris:8", results)
  })

  it("returns 400 INVALID_QUERY when q is below the minimum length", async () => {
    const response = await GET(makeRequest("?q=a"))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error.code).toBe("INVALID_QUERY")
    expect(body.error).not.toHaveProperty("stack")
  })

  it("returns 429 RATE_LIMITED before calling the provider", async () => {
    vi.mocked(checkLimit).mockReturnValue(false)
    const provider = { search: vi.fn(), reverseGeocode: vi.fn() }
    vi.mocked(getGeocodingProvider).mockReturnValue(provider)

    const response = await GET(makeRequest("?q=paris"))
    const body = await response.json()

    expect(response.status).toBe(429)
    expect(body.error.code).toBe("RATE_LIMITED")
    expect(provider.search).not.toHaveBeenCalled()
  })

  it("returns a cached result as 200 without checking the limiter", async () => {
    const cached = [{ id: "1", displayName: "Paris", lat: 48.85, lng: 2.35 }]
    vi.mocked(getCached).mockReturnValue(cached)

    const response = await GET(makeRequest("?q=paris"))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ results: cached })
    expect(checkLimit).not.toHaveBeenCalled()
  })

  it("returns 502 PROVIDER_UNAVAILABLE without a stack trace when the provider throws", async () => {
    vi.mocked(getGeocodingProvider).mockReturnValue({
      search: vi.fn().mockRejectedValue(new Error("boom")),
      reverseGeocode: vi.fn(),
    })

    const response = await GET(makeRequest("?q=paris"))
    const body = await response.json()

    expect(response.status).toBe(502)
    expect(body.error.code).toBe("PROVIDER_UNAVAILABLE")
    expect(JSON.stringify(body)).not.toContain("boom")
  })
})
