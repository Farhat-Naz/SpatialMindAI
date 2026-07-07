import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { reverseGeocode, ReverseGeocodeServiceError } from "../services/reverseGeocodeService"

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

describe("reverseGeocodeService.reverseGeocode", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("returns the resolved address on a 200 response", async () => {
    const result = { displayName: "Paris, France", lat: 48.85, lng: 2.35 }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ result }, 200))

    await expect(reverseGeocode(48.85, 2.35)).resolves.toEqual(result)
  })

  it("returns null (not a thrown error) when the point has no address", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ result: null }, 200))

    await expect(reverseGeocode(0, 0)).resolves.toBeNull()
  })

  it("throws a ReverseGeocodeServiceError preserving code/message on a 400 response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ error: { code: "INVALID_COORDINATES", message: "Coordinates out of range" } }, 400)
    )

    const error = await reverseGeocode(999, 0).catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ReverseGeocodeServiceError)
    expect(error).toMatchObject({ code: "INVALID_COORDINATES", message: "Coordinates out of range" })
  })

  it("throws a PROVIDER_UNAVAILABLE error when fetch itself rejects", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError("Failed to fetch"))

    await expect(reverseGeocode(48.85, 2.35)).rejects.toMatchObject({
      code: "PROVIDER_UNAVAILABLE",
    })
  })
})
