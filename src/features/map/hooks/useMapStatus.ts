import { useMapStore } from "@/features/map/store/mapStore"

export function useMapStatus() {
  const mapStatus = useMapStore((s) => s.mapStatus)
  const errorMessage = useMapStore((s) => s.errorMessage)
  const retry = useMapStore((s) => s.retry)

  return {
    mapStatus,
    isLoading: mapStatus === "loading",
    isReady: mapStatus === "ready",
    isError: mapStatus === "error",
    errorMessage,
    retry,
  }
}
