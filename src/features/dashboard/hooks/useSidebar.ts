import { useEffect } from "react"
import { useDashboardStore } from "@/features/dashboard/store/dashboardStore"
import { useBreakpoint } from "./useBreakpoint"

export function useSidebar() {
  const sidebarState = useDashboardStore((state) => state.sidebarState)
  const toggle = useDashboardStore((state) => state.toggleSidebar)
  const autoCollapseForMobile = useDashboardStore(
    (state) => state.autoCollapseForMobile
  )
  const restoreDesktopState = useDashboardStore(
    (state) => state.restoreDesktopState
  )

  const isMobile = useBreakpoint(767)

  useEffect(() => {
    if (isMobile) {
      autoCollapseForMobile()
    } else {
      restoreDesktopState()
    }
  }, [isMobile, autoCollapseForMobile, restoreDesktopState])

  const isExpanded = sidebarState === "expanded"

  return {
    sidebarState,
    isExpanded,
    toggle,
    autoCollapseForMobile,
    restoreDesktopState,
  }
}
