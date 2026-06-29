# Contract: Custom Hook API

**Feature**: 001-app-foundation
**Date**: 2026-06-29

This document defines the return shapes and usage contracts for every custom hook
in Phase 1. Hooks MUST encapsulate all business logic. Components MUST NOT contain
logic that belongs in a hook.

---

## useTheme

**Path**: `features/theme/hooks/useTheme.ts`

```typescript
interface UseThemeReturn {
  theme: 'light' | 'dark'
  toggle: () => void
  setTheme: (theme: 'light' | 'dark') => void
  isDark: boolean   // Convenience: theme === 'dark'
}
```

**Usage**: Called in `ThemeToggle` and `ThemeProvider`. Not for use in map components.

---

## useSidebar

**Path**: `features/dashboard/hooks/useSidebar.ts`

```typescript
type SidebarState = 'expanded' | 'collapsed'

interface UseSidebarReturn {
  sidebarState: SidebarState
  isExpanded: boolean                  // Convenience: sidebarState === 'expanded'
  toggle: () => void                   // Manual user toggle
  autoCollapseForMobile: () => void    // Called by useBreakpoint integration
  restoreDesktopState: () => void      // Called by useBreakpoint integration
}
```

**Usage**: Called in `DashboardLayout`. Internally uses `dashboardStore` and
coordinates with `useBreakpoint`.

---

## useBreakpoint

**Path**: `features/dashboard/hooks/useBreakpoint.ts`

```typescript
// Returns true if viewport width <= maxWidth
function useBreakpoint(maxWidth: number): boolean
```

**Example**: `const isMobile = useBreakpoint(767)` (true when viewport ≤ 767px)

**Implementation**: Uses `window.matchMedia('(max-width: {maxWidth}px)')` with
a resize listener. Initializes synchronously on mount to avoid flash.

---

## useMapInstance

**Path**: `features/map/hooks/useMapInstance.ts`

```typescript
import type { Map as LeafletMap } from 'leaflet'

interface UseMapInstanceReturn {
  mapRef: React.RefObject<HTMLDivElement>  // Attach to map container div
  map: LeafletMap | null                   // Leaflet map instance (null before init)
  isInitialized: boolean
}
```

**Usage**: Called only inside `MapCore` (the client-only component). Manages
Leaflet lifecycle: init on mount, destroy on unmount.

---

## useMapStatus

**Path**: `features/map/hooks/useMapStatus.ts`

```typescript
type MapStatus = 'idle' | 'loading' | 'ready' | 'error'

interface UseMapStatusReturn {
  mapStatus: MapStatus
  isLoading: boolean
  isReady: boolean
  isError: boolean
  errorMessage: string | null
  retry: () => void   // Transitions error → loading, re-attaches tile layer
}
```

**Usage**: Called in `MapCore` to wire Leaflet events to `mapStore`. Also used in
`MapContainer` to render the correct overlay (loading / error / none).

---

## useCoordinates

**Path**: `features/map/hooks/useCoordinates.ts`

```typescript
import type { Map as LeafletMap } from 'leaflet'

interface UseCoordinatesOptions {
  map: LeafletMap | null
  throttleMs?: number   // Default: 16
}

interface UseCoordinatesReturn {
  coords: { lat: number; lng: number } | null
  formattedLat: string   // e.g., "51.5074° N"
  formattedLng: string   // e.g., "0.1278° W"
  isReady: boolean       // false until mapStatus === 'ready'
}
```

**Behavior**: Registers a throttled Leaflet `mousemove` listener. Updates
`mapStore.lastKnownCoords` on move. Returns last known value when cursor leaves map.
Returns `null` and `"—"` formatted strings before map is ready.

---

## useLocalStorage (shared)

**Path**: `shared/hooks/useLocalStorage.ts`

```typescript
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void]
```

**Usage**: Generic typed hook for localStorage read/write with JSON serialization.
Used internally by Zustand persist middleware — not typically called directly in
components.

---

## useMediaQuery (shared)

**Path**: `shared/hooks/useMediaQuery.ts`

```typescript
function useMediaQuery(query: string): boolean
```

**Example**: `useMediaQuery('(prefers-reduced-motion: reduce)')`

**Usage**: Base primitive used by `useBreakpoint`. Can also be used for
`prefers-reduced-motion` to disable sidebar animation for accessibility.
