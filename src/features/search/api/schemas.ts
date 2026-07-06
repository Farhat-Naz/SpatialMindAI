import { z } from "zod"

const MIN_QUERY_LENGTH = 2
const DEFAULT_RESULT_LIMIT = 8
const MAX_RESULT_LIMIT = 10

/**
 * Validates and normalizes `GET /api/search` query parameters. `q` is
 * trimmed and MUST be at least 2 characters; `limit` defaults to 8 and is
 * clamped (not rejected) at a maximum of 10.
 */
export const searchQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(MIN_QUERY_LENGTH, `Query must be at least ${MIN_QUERY_LENGTH} characters`),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .default(DEFAULT_RESULT_LIMIT)
    .transform((value) => Math.min(value, MAX_RESULT_LIMIT)),
})

/**
 * Validates and normalizes `GET /api/reverse-geocode` query parameters.
 * Both `lat` and `lng` are required and MUST fall within valid geographic
 * ranges.
 */
export const reverseGeocodeQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
})

export type SearchQueryInput = z.infer<typeof searchQuerySchema>
export type ReverseGeocodeQueryInput = z.infer<typeof reverseGeocodeQuerySchema>
