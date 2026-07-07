import type { ReverseGeocodeResult, SearchApiError } from "@/features/search/types/search.types"

interface ReverseGeocodeSuccessBody {
  result: ReverseGeocodeResult | null
}

interface ReverseGeocodeErrorBody {
  error: SearchApiError
}

const UNAVAILABLE_ERROR: SearchApiError = {
  code: "PROVIDER_UNAVAILABLE",
  message: "Reverse geocoding is temporarily unavailable",
}

/** Typed error thrown by `reverseGeocode()`, preserving the Route Handler's `code`/`message`. */
export class ReverseGeocodeServiceError extends Error implements SearchApiError {
  code: SearchApiError["code"]

  constructor(error: SearchApiError) {
    super(error.message)
    this.name = "ReverseGeocodeServiceError"
    this.code = error.code
  }
}

/**
 * Fetches the reverse-geocode result from `GET /api/reverse-geocode` — the
 * only module permitted to call that endpoint directly. A resolved `null`
 * result (no address found) is returned normally, not thrown.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
  const params = new URLSearchParams({ lat: String(lat), lng: String(lng) })

  let response: Response
  try {
    response = await fetch(`/api/reverse-geocode?${params.toString()}`)
  } catch {
    throw new ReverseGeocodeServiceError(UNAVAILABLE_ERROR)
  }

  const body = (await response.json()) as ReverseGeocodeSuccessBody | ReverseGeocodeErrorBody

  if (!response.ok || "error" in body) {
    throw new ReverseGeocodeServiceError("error" in body ? body.error : UNAVAILABLE_ERROR)
  }

  return body.result
}
