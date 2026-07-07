import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { NominatimProvider } from "../api/nominatimProvider"

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}

describe("NominatimProvider", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe("search", () => {
    it("maps a full Nominatim search result to SearchResult", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        jsonResponse([
          {
            place_id: 123,
            display_name: "Paris, France",
            lat: "48.8566",
            lon: "2.3522",
            boundingbox: ["48.8", "48.9", "2.3", "2.4"],
            type: "city",
            importance: 0.9,
          },
        ])
      )

      const results = await new NominatimProvider().search("paris", 8)

      expect(results).toEqual([
        {
          id: "123",
          displayName: "Paris, France",
          lat: 48.8566,
          lng: 2.3522,
          boundingBox: [48.8, 2.3, 48.9, 2.4],
          category: "city",
          importance: 0.9,
        },
      ])
    })

    it("does not throw when boundingbox is missing", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        jsonResponse([{ place_id: 1, display_name: "Nowhere", lat: "0", lon: "0" }])
      )

      const results = await new NominatimProvider().search("nowhere", 8)

      expect(results).toEqual([{ id: "1", displayName: "Nowhere", lat: 0, lng: 0 }])
    })
  })

  describe("reverseGeocode", () => {
    it("maps a full Nominatim reverse result to ReverseGeocodeResult", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        jsonResponse({
          display_name: "1 Rue de Rivoli, Paris",
          lat: "48.8566",
          lon: "2.3522",
          address: {
            road: "Rue de Rivoli",
            city: "Paris",
            state: "Île-de-France",
            country: "France",
            postcode: "75001",
          },
        })
      )

      const result = await new NominatimProvider().reverseGeocode(48.8566, 2.3522)

      expect(result).toEqual({
        displayName: "1 Rue de Rivoli, Paris",
        lat: 48.8566,
        lng: 2.3522,
        address: {
          road: "Rue de Rivoli",
          city: "Paris",
          state: "Île-de-France",
          country: "France",
          postalCode: "75001",
        },
      })
    })

    it("does not throw when address sub-fields are missing", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        jsonResponse({ display_name: "Somewhere", lat: "1", lon: "2", address: {} })
      )

      const result = await new NominatimProvider().reverseGeocode(1, 2)

      expect(result?.address).toEqual({
        road: undefined,
        city: undefined,
        state: undefined,
        country: undefined,
        postalCode: undefined,
      })
    })

    it("returns null (not a thrown error) when Nominatim reports no result", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ error: "Unable to geocode" }))

      const result = await new NominatimProvider().reverseGeocode(0, 0)

      expect(result).toBeNull()
    })
  })
})
