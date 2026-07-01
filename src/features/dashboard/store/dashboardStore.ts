import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { SidebarState } from "@/shared/types/common.types"

type DashboardState = {
  sidebarState: SidebarState
  desktopSidebarPreference: SidebarState
}

type DashboardActions = {
  toggleSidebar: () => void
  autoCollapseForMobile: () => void
  restoreDesktopState: () => void
}

type DashboardStore = DashboardState & DashboardActions

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      sidebarState: "expanded",
      desktopSidebarPreference: "expanded",
      toggleSidebar: () => {
        const next: SidebarState =
          get().sidebarState === "expanded" ? "collapsed" : "expanded"
        set({ sidebarState: next, desktopSidebarPreference: next })
      },
      autoCollapseForMobile: () => {
        set({ sidebarState: "collapsed" })
      },
      restoreDesktopState: () => {
        set((state) => ({ sidebarState: state.desktopSidebarPreference }))
      },
    }),
    {
      name: "spatialMind:sidebar",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        desktopSidebarPreference: state.desktopSidebarPreference,
      }),
    }
  )
)
