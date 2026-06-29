# Contract: Component Public API

**Feature**: 001-app-foundation
**Date**: 2026-06-29

This document defines the TypeScript prop interfaces for all public-facing React
components. Components MUST NOT accept `any` props. Internal implementation components
(used only within their own feature) are not listed here.

---

## DashboardLayout

**Path**: `features/dashboard/components/DashboardLayout.tsx`
**Exported from**: `features/dashboard/index.ts`

```typescript
interface DashboardLayoutProps {
  children?: never  // Layout owns its children via feature imports
}
```

Note: DashboardLayout composes Navbar, Sidebar, MapContainer, and StatusBar internally.
It accepts no children — composition is internal.

---

## Navbar

**Path**: `features/dashboard/components/Navbar.tsx`

```typescript
interface NavbarProps {
  onMenuToggle: () => void    // Called when hamburger is pressed (mobile only)
  isMobile: boolean           // Controls hamburger vs. desktop toolbar display
}
```

---

## Sidebar

**Path**: `features/dashboard/components/Sidebar.tsx`

```typescript
type SidebarState = 'expanded' | 'collapsed'

interface SidebarProps {
  state: SidebarState
  onToggle: () => void        // Collapse/expand control
  children?: React.ReactNode  // Nav item slots (empty in Phase 1; extensible)
}
```

---

## SidebarToggle

**Path**: `features/dashboard/components/SidebarToggle.tsx`

```typescript
interface SidebarToggleProps {
  isExpanded: boolean
  onToggle: () => void
  className?: string
}
```

---

## StatusBar

**Path**: `features/dashboard/components/StatusBar.tsx`

```typescript
interface StatusBarProps {
  // Reads from mapStore directly via hook — no props required
  // Accepts optional children for future plugin slots
  children?: React.ReactNode
}
```

---

## Toolbar

**Path**: `features/dashboard/components/Toolbar.tsx`

```typescript
interface ToolbarProps {
  children?: React.ReactNode  // Icon button slots; empty in Phase 1
  className?: string
}
```

---

## ThemeToggle

**Path**: `features/theme/components/ThemeToggle.tsx`
**Exported from**: `features/theme/index.ts`

```typescript
interface ThemeToggleProps {
  className?: string
}
// Reads and writes themeStore directly via useTheme hook
// No theme prop — single source of truth is the store
```

---

## MapContainer

**Path**: `features/map/components/MapContainer.tsx`
**Exported from**: `features/map/index.ts`

```typescript
interface MapContainerProps {
  className?: string
}
// MapContainer is a server-safe wrapper around MapCore (loaded client-only).
// It renders MapLoadingOverlay and MapErrorOverlay based on mapStore.mapStatus.
```

---

## LayerSwitcher

**Path**: `features/map/components/LayerSwitcher.tsx`

```typescript
import type { BasemapConfig } from '../constants/basemaps'

interface LayerSwitcherProps {
  basemaps: readonly BasemapConfig[]
  activeBasemapId: string
  onBasemapChange: (id: string) => void
  className?: string
}
```

---

## MapLoadingOverlay

**Path**: `features/map/components/MapLoadingOverlay.tsx`

```typescript
interface MapLoadingOverlayProps {
  visible: boolean    // Controlled by mapStatus === 'loading'
}
```

---

## MapErrorOverlay

**Path**: `features/map/components/MapErrorOverlay.tsx`

```typescript
interface MapErrorOverlayProps {
  visible: boolean    // Controlled by mapStatus === 'error'
  message: string | null
  onRetry: () => void
}
```

---

## LoadingSpinner (shared)

**Path**: `shared/components/LoadingSpinner.tsx`

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'   // Default: 'md'
  label?: string               // aria-label; default: 'Loading'
  className?: string
}
```

---

## ErrorBoundary (shared)

**Path**: `shared/components/ErrorBoundary.tsx`

```typescript
interface ErrorBoundaryProps {
  fallback: React.ReactNode   // Rendered on uncaught error
  children: React.ReactNode
}
```
