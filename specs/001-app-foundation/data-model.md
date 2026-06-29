# Data Model: Platform Foundation & Map Shell

**Feature**: 001-app-foundation
**Date**: 2026-06-29

Phase 1 has no database. All state is ephemeral (in-memory Zustand) or persisted to
`localStorage`. This document defines the shapes, validation rules, and state machines
for all entities managed by the three Zustand stores.

---

## Entity: Theme

**Store**: `features/theme/store/themeStore.ts`
**Persistence**: localStorage key `spatialMind:theme`

```
Theme = 'light' | 'dark'
```

| Field | Type | Default | Persistence | Constraint |
|---|---|---|---|---|
| `theme` | `'light' \| 'dark'` | `'light'` | localStorage | MUST be one of the two values; invalid stored values fall back to `'light'` |

**State Transitions**:

```
'light' ──(toggle)──→ 'dark'
'dark'  ──(toggle)──→ 'light'
```

**Initialization Rule**: On app load, read `spatialMind:theme` from localStorage.
If missing or invalid, default to `'light'`. Apply before first paint (ThemeProvider
reads from store and sets `dark` class on `<html>`).

---

## Entity: SidebarState

**Store**: `features/dashboard/store/dashboardStore.ts`
**Persistence**: localStorage key `spatialMind:sidebar` (only `desktopSidebarPreference`)

| Field | Type | Default | Persistence | Notes |
|---|---|---|---|---|
| `sidebarState` | `'expanded' \| 'collapsed'` | `'expanded'` | No | Runtime state; resets to expanded on page load |
| `desktopSidebarPreference` | `'expanded' \| 'collapsed'` | `'expanded'` | Yes | Saved when user manually toggles on desktop |
| `isMobile` | `boolean` | computed | No | Derived from viewport; not stored |

**State Transitions**:

```
Desktop viewport (≥ 768px):
  'expanded' ──(user toggle)──────────→ 'collapsed'  [saves desktopSidebarPreference]
  'collapsed' ──(user toggle)─────────→ 'expanded'   [saves desktopSidebarPreference]
  any ──(viewport drops < 768px)──────→ 'collapsed'  [saves desktopSidebarPreference = current]
  'collapsed' ──(viewport ≥ 768px)────→ desktopSidebarPreference  [restored]

Mobile viewport (< 768px):
  hidden ──(hamburger tap)────────────→ Sheet overlay open
  Sheet open ──(tap outside / Esc)────→ hidden
```

**Validation Rules**:
- `desktopSidebarPreference` loaded from localStorage on init; invalid values default to `'expanded'`
- Auto-collapse on mobile MUST NOT overwrite `desktopSidebarPreference`
- Sidebar animation (CSS `transition: width 300ms ease`) triggers on every state change;
  `map.invalidateSize()` called after 300 ms delay

---

## Entity: MapViewState

**Store**: `features/map/store/mapStore.ts`
**Persistence**: None (resets to defaults on page load)

| Field | Type | Default | Constraint |
|---|---|---|---|
| `center` | `LatLng` | `{ lat: 20, lng: 0 }` | Valid lat: −90 to 90; valid lng: −180 to 180 |
| `zoom` | `number` | `2` | Integer 0–18; must respect basemap `maxZoom` |
| `activeBasemapId` | `string` | `'osm-street'` | MUST match an id in `basemaps.ts`; unknown id falls back to `'osm-street'` |
| `mapStatus` | `MapStatus` | `'idle'` | See FSM below |
| `lastKnownCoords` | `LatLng \| null` | `null` | Set to null when mapStatus ≠ 'ready'; updated on mousemove |
| `errorMessage` | `string \| null` | `null` | Set on tile load failure; cleared on retry or ready |

**MapStatus FSM**:

```
'idle' ──(map init starts)────────────→ 'loading'
'loading' ──(Leaflet 'load' event)────→ 'ready'
'loading' ──(tile error event)────────→ 'error'
'error' ──(retry() called)────────────→ 'loading'
'ready' ──(active basemap changed)────→ 'loading'  [brief reload]
```

**LatLng Type** (shared):
```
LatLng = { lat: number; lng: number }
```

**Coordinate Display Rules**:
- `mapStatus = 'idle' | 'loading'`: Display `"— , —"` and `"— "` for zoom
- `mapStatus = 'ready'`: Display formatted coords from `lastKnownCoords` (or map center if null)
- `mapStatus = 'error'`: Display `"— , —"` (error overlay takes precedence)
- Off-map: `lastKnownCoords` retains last value; display does not clear

---

## Entity: BasemapConfig

**Location**: `features/map/constants/basemaps.ts` (static, not in store)

| Field | Type | Constraint |
|---|---|---|
| `id` | `string` | Unique identifier; used as `activeBasemapId` |
| `name` | `string` | Human-readable label for LayerSwitcher |
| `urlTemplate` | `string` | Valid Leaflet tile URL template with `{z}`, `{x}`, `{y}` |
| `attribution` | `string` | Required by tile provider license; MUST be displayed on map |
| `maxZoom` | `number` | Maximum zoom level supported by provider |

**Phase 1 Basemaps**:

| id | name | maxZoom | Source |
|---|---|---|---|
| `osm-street` | OpenStreetMap | 19 | tile.openstreetmap.org |
| `esri-satellite` | Satellite Imagery | 18 | ArcGIS World Imagery |

**CSP Requirement**: CSP `img-src` and `connect-src` MUST include:
- `https://*.tile.openstreetmap.org`
- `https://server.arcgisonline.com`

---

## Shared Types

**Location**: `shared/types/common.types.ts`

| Type | Definition | Usage |
|---|---|---|
| `LatLng` | `{ lat: number; lng: number }` | Map coordinates throughout |
| `Nullable<T>` | `T \| null` | Explicit nullable fields |
| `Theme` | `'light' \| 'dark'` | Imported from features/theme |
| `SidebarState` | `'expanded' \| 'collapsed'` | Imported from features/dashboard |
| `MapStatus` | `'idle' \| 'loading' \| 'ready' \| 'error'` | Imported from features/map |
