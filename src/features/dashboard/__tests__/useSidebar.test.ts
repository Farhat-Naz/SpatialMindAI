import { beforeEach, describe, expect, it } from "vitest"
import { act, renderHook } from "@testing-library/react"
import { useSidebar } from "../hooks/useSidebar"
import { useDashboardStore } from "../store/dashboardStore"

const DEFAULT_STATE = {
  sidebarState: "expanded" as const,
  desktopSidebarPreference: "expanded" as const,
}

function stubDesktopMatchMedia() {
  window.matchMedia = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}

describe("useSidebar", () => {
  beforeEach(() => {
    stubDesktopMatchMedia()
    useDashboardStore.setState(DEFAULT_STATE)
    window.localStorage.clear()
  })

  it("toggle changes sidebar state", () => {
    const { result } = renderHook(() => useSidebar())

    expect(result.current.sidebarState).toBe("expanded")

    act(() => {
      result.current.toggle()
    })

    expect(result.current.sidebarState).toBe("collapsed")
  })

  it("toggle saves desktopSidebarPreference", () => {
    const { result } = renderHook(() => useSidebar())

    act(() => {
      result.current.toggle()
    })
    expect(useDashboardStore.getState().desktopSidebarPreference).toBe(
      "collapsed"
    )

    act(() => {
      result.current.toggle()
    })
    expect(useDashboardStore.getState().desktopSidebarPreference).toBe(
      "expanded"
    )
  })

  it("autoCollapseForMobile does not change desktopSidebarPreference", () => {
    const { result } = renderHook(() => useSidebar())
    const preferenceBefore =
      useDashboardStore.getState().desktopSidebarPreference

    act(() => {
      result.current.autoCollapseForMobile()
    })

    expect(result.current.sidebarState).toBe("collapsed")
    expect(useDashboardStore.getState().desktopSidebarPreference).toBe(
      preferenceBefore
    )
  })

  it("restoreDesktopState restores the saved desktopSidebarPreference", () => {
    const { result } = renderHook(() => useSidebar())

    act(() => {
      result.current.autoCollapseForMobile()
    })
    expect(result.current.sidebarState).toBe("collapsed")
    expect(useDashboardStore.getState().desktopSidebarPreference).toBe(
      "expanded"
    )

    act(() => {
      result.current.restoreDesktopState()
    })

    expect(result.current.sidebarState).toBe("expanded")
  })
})
