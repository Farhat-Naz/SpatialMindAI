import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { search, SearchServiceError } from "../services/searchService"

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

describe("searchService.search", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("returns results on a 200 response", async () => {
    const results = [{ id: "1", displayName: "Paris", lat: 48.85, lng: 2.35 }]
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ results }, 200))

    await expect(search("paris", 8)).resolves.toEqual(results)
  })

  it("calls the search endpoint with q and limit", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ results: [] }, 200))

    await search("paris", 5)

    const calledUrl = vi.mocked(fetch).mock.calls[0]?.[0] as string
    expect(calledUrl).toContain("/api/search?")
    expect(calledUrl).toContain("q=paris")
    expect(calledUrl).toContain("limit=5")
  })

  it("throws a SearchServiceError preserving code/message on a 400 response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ error: { code: "INVALID_QUERY", message: "Query too short" } }, 400)
    )

    const error = await search("a", 8).catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(SearchServiceError)
    expect(error).toMatchObject({ code: "INVALID_QUERY", message: "Query too short" })
  })

  it("throws a PROVIDER_UNAVAILABLE SearchServiceError on a 502 response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ error: { code: "PROVIDER_UNAVAILABLE", message: "Search is temporarily unavailable" } }, 502)
    )

    await expect(search("paris", 8)).rejects.toMatchObject({
      code: "PROVIDER_UNAVAILABLE",
    })
  })

  it("throws a PROVIDER_UNAVAILABLE SearchServiceError when fetch itself rejects", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError("Failed to fetch"))

    await expect(search("paris", 8)).rejects.toMatchObject({
      code: "PROVIDER_UNAVAILABLE",
    })
  })
})
