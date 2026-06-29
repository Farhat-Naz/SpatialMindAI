# Contract: Zustand Store API

**Feature**: 001-app-foundation
**Date**: 2026-06-29

This document defines the shape and public action surface of each Zustand store.
Components and hooks MUST access stores only through these defined actions.
Direct store mutation outside of actions is forbidden.

---

## themeStore

**Path**: `features/theme/store/themeStore.ts`
**Persistence**: `localStorage` key `spatialMind:theme`

### State Shape

```typescript
type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
}
```

### Actions

```typescript
interface ThemeActions {
  setTheme: (theme: Theme) => void
  toggle: () => void   // 'light' → 'dark' → 'light'
}
```

### Initialization

On hydration: read `spatialMind:theme` from localStorage.
Invalid or missing value → defaults to `'light'`.

---

## dashboardStore

**Path**: `features/dashboard/store/dashboardStore.ts`
**Persistence**: `localStorage` key `spatialMind:sidebar`
(only `desktopSidebarPreference` is persisted; `sidebarState` is runtime-only)

### State Shape

```typescript
type SidebarState = 'expanded' | 'collapsed'

interface DashboardState {
  sidebarState: SidebarState                 // Runtime — resets on load
  desktopSidebarPreference: SidebarState     // Persisted to localStorage
}
```

### Actions

```typescript
interface DashboardActions {
  // Manual user toggle — also updates desktopSidebarPreference
  toggleSidebar: () => void

  // Called by useBreakpoint when viewport < 768px
  // Saves current sidebarState as desktopSidebarPreference before collapsing
  autoCollapseForMobile: () => void

  // Called by useBreakpoint when viewport returns to ≥ 768px
  // Restores sidebarState from desktopSidebarPreference
  restoreDesktopState: () => void
}
```

### Initialization

On hydration: `sidebarState` initializes to `'expanded'`.
`desktopSidebarPreference` is read from localStorage (defaults to `'expanded'`).

---

## mapStore

**Path**: `features/map/store/mapStore.ts`
**Persistence**: None

### State Shape

```typescript
type MapStatus = 'idle' | 'loading' | 'ready' | 'error'

interface LatLng {
  lat: number
  lng: number
}

interface MapState {
  center: LatLng
  zoom: number
  activeBasemapId: string
  mapStatus: MapStatus
  lastKnownCoords: LatLng | null
  errorMessage: string | null
}
```

### Defaults

```typescript
const defaults: MapState = {
  center: { lat: 20, lng: 0 },
  zoom: 2,
  activeBasemapId: 'osm-street',
  mapStatus: 'idle',
  lastKnownCoords: null,
  errorMessage: null,
}
```

### Actions

```typescript
interface MapActions {
  // Called by Leaflet map move events
  setCenter: (latlng: LatLng) => void
  setZoom: (zoom: number) => void

  // Called by LayerSwitcher
  setActiveBasemap: (id: string) => void

  // Called by useMapStatus to drive the FSM
  setMapStatus: (status: MapStatus) => void

  // Called by useCoordinates (throttled mousemove)
  setLastKnownCoords: (latlng: LatLng) => void

  // Called on tile error event; sets status = 'error' + message
  setError: (message: string) => void

  // Called by Retry button; transitions error → loading
  retry: () => void
}
```
