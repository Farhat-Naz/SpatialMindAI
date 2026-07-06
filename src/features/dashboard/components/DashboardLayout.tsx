"use client"

import { useState } from "react"
import { Navbar } from "./Navbar"
import { Sidebar } from "./Sidebar"
import { MobileNav } from "./MobileNav"
import { StatusBar } from "./StatusBar"
import { useSidebar } from "../hooks/useSidebar"
import { useBreakpoint } from "../hooks/useBreakpoint"
import { MapContainer } from "@/features/map"

export function DashboardLayout() {
  const { sidebarState, toggle } = useSidebar()
  const isMobile = useBreakpoint(767)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="grid h-screen grid-rows-[auto_1fr_auto] overflow-hidden">
      <Navbar
        onMenuToggle={() => setMobileNavOpen(true)}
        isMobile={isMobile}
      />
      <div className="grid min-h-0 grid-cols-[auto_minmax(0,1fr)] overflow-hidden">
        <div className="col-start-1 hidden md:flex">
          <Sidebar state={sidebarState} onToggle={toggle} />
        </div>
        {isMobile && (
          <MobileNav
            isOpen={mobileNavOpen}
            onClose={() => setMobileNavOpen(false)}
          >
            <Sidebar state={sidebarState} onToggle={toggle} />
          </MobileNav>
        )}
        <MapContainer className="col-start-2 h-full min-h-0 w-full min-w-0" />
      </div>
      <StatusBar />
    </div>
  )
}
