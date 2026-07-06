import type { z } from "zod"
import type { SearchApiError } from "@/features/search/types/search.types"

export type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: SearchApiError }

/**
 * Validates raw request params against a Zod schema, returning either the
 * parsed/normalized data or a typed, user-safe `SearchApiError`. Never
 * exposes the underlying Zod error object or issue paths to the caller.
 */
export function parseOrError<T>(
  schema: z.ZodType<T>,
  params: Record<string, string | undefined>,
  errorCode: SearchApiError["code"]
): ParseResult<T> {
  const result = schema.safeParse(params)

  if (result.success) {
    return { success: true, data: result.data }
  }

  const firstIssue = result.error.issues[0]
  return {
    success: false,
    error: {
      code: errorCode,
      message: firstIssue?.message ?? "Invalid request parameters",
    },
  }
}
