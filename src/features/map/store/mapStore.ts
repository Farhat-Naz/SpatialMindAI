import { create } from "zustand"
import type { LatLng, MapStatus, Nullable } from "@/shared/types/common.types"

type MapState = {
  center: LatLng
  zoom: number
  activeBasemapId: string
  mapStatus: MapStatus
  lastKnownCoords: Nullable<LatLng>
  errorMessage: Nullable<string>
}

type MapActions = {
  setCenter: (center: LatLng) => void
  setZoom: (zoom: number) => void
  setActiveBasemap: (id: string) => void
  setMapStatus: (status: MapStatus) => void
  setLastKnownCoords: (coords: Nullable<LatLng>) => void
  setError: (message: string) => void
  retry: () => void
}

type MapStore = MapState & MapActions

const initialState: MapState = {
  center: { lat: 20, lng: 0 },
  zoom: 2,
  activeBasemapId: "osm-street",
  mapStatus: "idle",
  lastKnownCoords: null,
  errorMessage: null,
}

export const useMapStore = create<MapStore>((set) => ({
  ...initialState,
  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  setActiveBasemap: (id) => set({ activeBasemapId: id }),
  setMapStatus: (mapStatus) => set({ mapStatus }),
  setLastKnownCoords: (lastKnownCoords) => set({ lastKnownCoords }),
  setError: (message) => set({ mapStatus: "error", errorMessage: message }),
  retry: () => set({ mapStatus: "loading", errorMessage: null }),
}))
