# Feature Specification: Platform Foundation & Map Shell

**Feature Branch**: `001-app-foundation`

**Created**: 2026-06-29

**Status**: Draft

**Input**: User description: "SpatialMind AI – Phase 1: Foundation — dashboard layout, interactive map, dark/light mode, responsive design, collapsible sidebar."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Full Dashboard Renders on Load (Priority: P1)

A user opens SpatialMind AI in their browser for the first time. They immediately see
a complete, professional dashboard: a top navigation bar with the application logo and
theme toggle, a collapsible left sidebar showing navigation items, a large interactive
map filling the main viewport, and a status bar at the bottom displaying map coordinates
and zoom level. The map displays a recognizable street map of the world with interactive
zoom controls and a scale indicator.

**Why this priority**: This is the core deliverable. Without a rendered dashboard and
interactive map, no other story can be evaluated. It validates the entire application
shell in a single flow.

**Independent Test**: Open the application in a browser. Confirm all four layout regions
are visible, the map loads with a street basemap, and the user can pan/zoom the map.

**Acceptance Scenarios**:

1. **Given** the application URL is opened, **When** the page finishes loading,
   **Then** a navbar, sidebar, map viewport, and status bar are all visible without
   scrolling on a 1280×800 display.
2. **Given** the dashboard is visible, **When** the user moves the cursor over the map,
   **Then** the status bar updates with the current geographic coordinates.
3. **Given** the map is displayed, **When** the user clicks the zoom-in control,
   **Then** the map zooms in one level and zoom controls, scale bar, and coordinate
   display remain visible and functional.
4. **Given** the map is displayed, **When** the user opens the layer switcher,
   **Then** at least two basemap options are listed and selecting one replaces the
   current basemap.

---

### User Story 2 - Dark / Light Theme Toggle (Priority: P2)

A user prefers working in dark mode to reduce eye strain during long GIS sessions.
They click the theme toggle in the navbar. The entire interface—navbar, sidebar, map
controls, status bar, and all UI elements—switches to a dark color scheme instantly.
When they refresh the page, the dark theme is still active.

**Why this priority**: Dark mode is explicitly required and is a cross-cutting concern
that affects every UI component. It must be validated early so all future feature
development happens against both themes.

**Independent Test**: Click the ThemeToggle in the navbar. Verify the UI transitions
to dark mode. Refresh and confirm the preference is retained.

**Acceptance Scenarios**:

1. **Given** the app is in light mode, **When** the user activates the theme toggle,
   **Then** all UI regions switch to dark styling with no unstyled flash.
2. **Given** dark mode is active, **When** the user refreshes the page,
   **Then** dark mode is still applied on reload.
3. **Given** dark mode is active, **When** the user activates the theme toggle again,
   **Then** the app returns to light mode.

---

### User Story 3 - Collapsible Sidebar (Priority: P3)

A GIS analyst working with a complex map wants to maximize the map viewport. They click
the sidebar collapse control. The sidebar narrows to a compact icon-only strip, giving
the map more horizontal space. Later, they click the strip to expand the sidebar back
to its full width and see navigation labels again.

**Why this priority**: The collapsible sidebar is a core UX feature for a map-heavy
application. It is independently testable without any GIS data or analysis features.

**Independent Test**: Click the collapse control; confirm the sidebar narrows and the
map expands. Click again; confirm the sidebar returns to full width.

**Acceptance Scenarios**:

1. **Given** the sidebar is expanded, **When** the user clicks the collapse control,
   **Then** the sidebar transitions to a narrow state within 300 ms and the map
   viewport increases in width.
2. **Given** the sidebar is collapsed, **When** the user clicks the expand control,
   **Then** the sidebar returns to full width with navigation labels visible.
3. **Given** the sidebar is either state, **When** the user navigates or refreshes,
   **Then** the sidebar state is consistent (or resets to expanded — either is acceptable
   for Phase 1).

---

### User Story 4 - Responsive Mobile Layout (Priority: P4)

A field engineer accesses SpatialMind AI on a smartphone to check a site location.
The map fills the screen. The sidebar is hidden by default. A hamburger menu icon in
the navbar lets the user open a slide-in navigation panel without obscuring the map
when closed.

**Why this priority**: Mobile responsiveness is a stated requirement. This story is
independently verifiable by resizing the browser to a mobile viewport.

**Independent Test**: Open a browser at 375 px width. Confirm the sidebar is hidden,
the map is full-width, and a hamburger/menu icon is visible in the navbar.

**Acceptance Scenarios**:

1. **Given** a viewport width of 375 px, **When** the page loads,
   **Then** the sidebar is not visible and a menu toggle is present in the navbar.
2. **Given** the sidebar is hidden on mobile, **When** the user taps the menu toggle,
   **Then** a navigation panel overlays the map and the map remains accessible after
   closing the panel.
3. **Given** the mobile navigation panel is open, **When** the user taps outside it
   or a close control, **Then** the panel closes and the full map is visible again.

---

### Edge Cases

- **Responsive sidebar on resize**: When the viewport drops below 768 px, the sidebar
  MUST auto-collapse with a smooth animation regardless of its current desktop state.
  When the viewport returns to ≥ 768 px, the sidebar MUST restore to the user's last
  desktop state (expanded or collapsed) with a smooth animation. The user's desktop
  sidebar preference is preserved across responsive breakpoint transitions.
- **Coordinate display off-map**: When the cursor leaves the map viewport, the status
  bar retains the last known cursor coordinates until the cursor re-enters the map.
- **Map initialization**: While the map is initializing or tiles are loading, a centered
  spinner/skeleton overlay is displayed on the map viewport. The overlay disappears
  automatically once the map is fully ready. The status bar shows "—" for coordinates
  and zoom level until the map is interactive.
- **Tile load failure**: If basemap tiles fail to load, the map viewport MUST display
  an error overlay with a visible "Retry" button; clicking Retry re-attempts tile
  loading without a full page refresh.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render a four-region dashboard layout consisting of a top
  navigation bar, a left sidebar, a main map viewport, and a bottom status bar.
- **FR-002**: System MUST display an interactive map with a street/road basemap loaded
  by default, supporting pan and zoom gestures.
- **FR-003**: The map MUST include a zoom-in and zoom-out control, a scale indicator,
  and a coordinate display that updates as the user moves the cursor over the map;
  when the cursor leaves the map viewport, the last known coordinates MUST be retained
  in the status bar until the cursor re-enters.
- **FR-004**: The map MUST include a layer switcher control offering at least two
  basemap options; selecting an option replaces the current basemap.
- **FR-005**: Users MUST be able to collapse the sidebar to a compact state and expand
  it again via a visible control. All collapse and expand transitions MUST use smooth
  animations completing within 300 ms.
- **FR-005a**: When the viewport width drops below 768 px, the sidebar MUST automatically
  collapse with a smooth animation. When the viewport width returns to ≥ 768 px, the
  sidebar MUST restore to the user's last desktop state (expanded or collapsed). The
  desktop sidebar preference MUST be preserved across responsive breakpoint transitions.
- **FR-006**: System MUST support light and dark visual themes switchable via a
  ThemeToggle control in the navbar.
- **FR-007**: The active theme preference MUST be persisted and restored on subsequent
  page loads.
- **FR-008**: The layout MUST be fully usable at viewport widths from 320 px to
  2560 px with no horizontal overflow.
- **FR-009**: At viewport widths below 768 px, the sidebar MUST be hidden by default
  and accessible via a navigation toggle in the navbar.
- **FR-010**: All interactive controls (sidebar toggle, theme toggle, map zoom, layer
  switcher) MUST be operable via keyboard alone with visible focus indicators.
- **FR-011**: When map tile loading fails due to a network error, the map viewport
  MUST display an error overlay with a "Retry" button; activating Retry MUST
  re-attempt tile loading without requiring a full page refresh.
- **FR-012**: While the map is initializing or tiles are loading, the map viewport
  MUST display a centered spinner/skeleton overlay that disappears automatically once
  the map is fully interactive. The status bar MUST show "—" for coordinates and zoom
  level until the map is ready.

### Non-Functional Requirements

- **NFR-001**: The production deployment MUST be served exclusively over HTTPS; HTTP
  requests MUST be redirected to HTTPS.
- **NFR-002**: The production deployment MUST include the following HTTP security
  headers, configured at the deployment/hosting layer:
  - **Content-Security-Policy (CSP)**: Restrict resource origins to known, trusted
    sources; allow map tile CDNs and the application origin.
  - **X-Frame-Options**: Set to `DENY` to prevent clickjacking.
  - **X-Content-Type-Options**: Set to `nosniff` to prevent MIME-type sniffing.
  - **Referrer-Policy**: Set to `strict-origin-when-cross-origin`.
  - **Strict-Transport-Security (HSTS)**: Enforce HTTPS for a minimum of 1 year
    with `includeSubDomains`.
- **NFR-003**: Security header configuration MUST be documented in deployment
  documentation; it MUST NOT require changes to application source code.

### Key Entities

- **Theme**: User's preferred color scheme (light or dark); persisted in local storage.
- **SidebarState**: Collapsed or expanded; controls how much horizontal space the
  sidebar occupies.
- **MapViewState**: Current center coordinates, zoom level, and active basemap
  selection; drives what the map displays.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The complete dashboard (all four layout regions plus a visible map) is
  interactive within 3 seconds on a standard broadband connection (≥ 25 Mbps).
- **SC-002**: Theme switching takes effect within 100 ms with no flash of unstyled
  content or layout shift.
- **SC-003**: Sidebar collapse and expand animations complete within 300 ms.
- **SC-004**: All interactive controls pass automated accessibility audit with zero
  critical violations (WCAG 2.1 AA).
- **SC-005**: The layout renders correctly and all controls are functional at 320 px,
  768 px, 1280 px, and 1920 px viewport widths.
- **SC-006**: The project builds with zero TypeScript errors and zero linting warnings,
  confirming production readiness for future modules.
- **SC-007**: The production deployment passes a security header audit with all five
  required headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
  HSTS) present and correctly configured.

## Clarifications

### Session 2026-06-29

- Q: What should happen when map tiles fail to load (network error)? → A: Show an error overlay on the map viewport with a "Retry" button that re-attempts tile loading without a full page refresh.
- Q: What is shown during map initialization and tile loading? → A: A centered spinner/skeleton overlay on the map viewport; the overlay disappears automatically once the map is fully ready.
- Q: How does the coordinate display behave when the cursor leaves the map area? → A: Retain the last known cursor coordinates in the status bar until the cursor re-enters the map viewport.
- Q: What happens when the browser is resized from desktop to mobile width while the sidebar is expanded? → A: Sidebar auto-collapses below 768 px with a smooth animation; restores the previous desktop state (expanded or collapsed) when the viewport returns to ≥ 768 px. The user's desktop sidebar preference is preserved across the transition.
- Q: What is the minimum security posture for production? → A: HTTPS required in production + standard HTTP security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS) configured at the deployment layer; these must be documented but must not affect Phase 1 application functionality.

## Assumptions

- Target browsers are the two most recent stable releases of Chrome, Firefox, Edge,
  and Safari. No Internet Explorer support required.
- No user authentication is required for Phase 1; the application is fully accessible
  without a login flow.
- The default map view is centered on a world-level zoom (showing all continents)
  suitable as a neutral starting point for any geographic use case.
- The layer switcher in Phase 1 offers exactly two basemap options: a street/road map
  and one alternative (satellite imagery); additional basemaps are out of scope.
- The status bar displays geographic coordinates (latitude, longitude) and the current
  zoom level at minimum; additional metadata (e.g., scale denominator) may be added
  but is not required.
- Sidebar state is not required to persist across sessions in Phase 1; it resets to
  expanded on page load.
- No routing beyond the root path (`/`) is implemented in Phase 1.
- All future GIS features (spatial analysis, layer import, AI) will be added as
  separate features built on this foundation.
