import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { LatLng } from "@/shared/types/common.types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formats a coordinate pair for status-bar display (4 decimal places).
 *  Returns "—" when coords are null (cursor off-map or map not yet ready). */
export function formatLatLng(coords: LatLng | null): string {
  if (coords === null) return "—"
  return `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
}

/** Constrains a number to the inclusive range [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
