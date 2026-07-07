export interface HighlightSegment {
  text: string
  isMatch: boolean
}

/**
 * Splits `text` into segments, case-insensitively flagging the first
 * occurrence of `query` as a match. Returns `text` unchanged (as a single
 * non-match segment) when there is no match or `query` is empty.
 */
export function highlightMatch(text: string, query: string): HighlightSegment[] {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) {
    return [{ text, isMatch: false }]
  }

  const matchIndex = text.toLowerCase().indexOf(trimmedQuery.toLowerCase())
  if (matchIndex === -1) {
    return [{ text, isMatch: false }]
  }

  const before = text.slice(0, matchIndex)
  const match = text.slice(matchIndex, matchIndex + trimmedQuery.length)
  const after = text.slice(matchIndex + trimmedQuery.length)

  const segments: HighlightSegment[] = []
  if (before) {
    segments.push({ text: before, isMatch: false })
  }
  segments.push({ text: match, isMatch: true })
  if (after) {
    segments.push({ text: after, isMatch: false })
  }

  return segments
}
