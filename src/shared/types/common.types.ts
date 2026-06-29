/** Geographic coordinate pair used throughout all GIS features. */
export type LatLng = {
  lat: number
  lng: number
}

/** Wraps any type T to make null an explicit, visible part of the type. */
export type Nullable<T> = T | null

/** UI color scheme — persisted in localStorage under `spatialMind:theme`. */
export type Theme = "light" | "dark"

/**
 * Sidebar visibility state.
 * - `expanded`: full-width panel visible
 * - `collapsed`: icon-strip only (desktop) or hidden (mobile Sheet)
 */
export type SidebarState = "expanded" | "collapsed"

/**
 * Leaflet map lifecycle state machine.
 *
 * Transitions:
 *   idle → loading → ready
 *                 → error → loading (retry)
 */
export type MapStatus = "idle" | "loading" | "ready" | "error"
