"use client"

import dynamic from "next/dynamic"

// Public barrel for the search feature — only these two components are
// exported for consumption outside the feature; all other internals
// (hooks, store, services, other components) stay private to the feature.
export { SearchBox } from "@/features/search/components/SearchBox"

// `ReverseGeocodePopup` pulls in `react-leaflet`/`leaflet`, which must never
// be evaluated on the server or bundled into the (SSR'd) Toolbar/SearchBox
// path that shares this same barrel file. Wrapping it in `next/dynamic`
// gives it its own code-split, client-only chunk regardless of which
// consumer touches this module.
export const ReverseGeocodePopup = dynamic(
  () =>
    import("@/features/search/components/ReverseGeocodePopup").then(
      (mod) => mod.ReverseGeocodePopup
    ),
  { ssr: false }
)
