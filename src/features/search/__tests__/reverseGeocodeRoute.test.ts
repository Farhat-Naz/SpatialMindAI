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

import { GET } from "../../../app/api/reverse-geocode/route"
import { getGeocodingProvider } from "@/features/search/api/getGeocodingProvider"
import { checkLimit, getCached, setCached } from "@/features/search/api/rateLimiter"

function makeRequest(query: string): NextRequest {
  return new NextRequest(`http://localhost/api/reverse-geocode${query}`)
}

describe("GET /api/reverse-geocode", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getCached).mockReturnValue(undefined)
    vi.mocked(checkLimit).mockReturnValue(true)
  })

  it("returns 200 with a result on a valid request", async () => {
    const result = { displayName: "Paris, France", lat: 48.85, lng: 2.35 }
    vi.mocked(getGeocodingProvider).mockReturnValue({
      search: vi.fn(),
      reverseGeocode: vi.fn().mockResolvedValue(result),
    })

    const response = await GET(makeRequest("?lat=48.85&lng=2.35"))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ result })
    expect(setCached).toHaveBeenCalledWith("reverseGeocode:48.85:2.35", result)
  })

  it("returns 200 with result: null when no address resolves, not an error", async () => {
    vi.mocked(getGeocodingProvider).mockReturnValue({
      search: vi.fn(),
      reverseGeocode: vi.fn().mockResolvedValue(null),
    })

    const response = await GET(makeRequest("?lat=0&lng=0"))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ result: null })
  })

  it("returns 400 INVALID_COORDINATES for out-of-range lat", async () => {
    const response = await GET(makeRequest("?lat=999&lng=0"))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error.code).toBe("INVALID_COORDINATES")
  })

  it("returns 429 RATE_LIMITED before calling the provider", async () => {
    vi.mocked(checkLimit).mockReturnValue(false)
    const provider = { search: vi.fn(), reverseGeocode: vi.fn() }
    vi.mocked(getGeocodingProvider).mockReturnValue(provider)

    const response = await GET(makeRequest("?lat=48.85&lng=2.35"))
    const body = await response.json()

    expect(response.status).toBe(429)
    expect(body.error.code).toBe("RATE_LIMITED")
    expect(provider.reverseGeocode).not.toHaveBeenCalled()
  })

  it("returns 502 PROVIDER_UNAVAILABLE when the provider throws", async () => {
    vi.mocked(getGeocodingProvider).mockReturnValue({
      search: vi.fn(),
      reverseGeocode: vi.fn().mockRejectedValue(new Error("boom")),
    })

    const response = await GET(makeRequest("?lat=48.85&lng=2.35"))
    const body = await response.json()

    expect(response.status).toBe(502)
    expect(body.error.code).toBe("PROVIDER_UNAVAILABLE")
    expect(JSON.stringify(body)).not.toContain("boom")
  })
})
