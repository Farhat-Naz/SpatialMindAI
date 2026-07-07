import { describe, expect, it } from "vitest"
import { highlightMatch } from "../utils/highlightMatch"
import { formatDistance } from "../utils/formatDistance"

describe("highlightMatch", () => {
  it("marks the matched substring", () => {
    expect(highlightMatch("Paris, France", "par")).toEqual([
      { text: "Par", isMatch: true },
      { text: "is, France", isMatch: false },
    ])
  })

  it("matches case-insensitively", () => {
    expect(highlightMatch("Paris, France", "PAR")).toEqual([
      { text: "Par", isMatch: true },
      { text: "is, France", isMatch: false },
    ])
  })

  it("returns the original text unchanged when there is no match", () => {
    expect(highlightMatch("Paris, France", "xyz")).toEqual([
      { text: "Paris, France", isMatch: false },
    ])
  })

  it("returns the original text unchanged for an empty query", () => {
    expect(highlightMatch("Paris, France", "")).toEqual([
      { text: "Paris, France", isMatch: false },
    ])
  })
})

describe("formatDistance", () => {
  it("returns the category when present", () => {
    expect(formatDistance("city")).toBe("city")
  })

  it("returns an empty string (not undefined) when unavailable", () => {
    expect(formatDistance(undefined)).toBe("")
  })
})
