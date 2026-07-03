"use client"

import { Navbar } from "./Navbar"
import { Sidebar } from "./Sidebar"
import { StatusBar } from "./StatusBar"
import { useSidebar } from "../hooks/useSidebar"
import { MapContainer } from "@/features/map"

export function DashboardLayout() {
  const { sidebarState, toggle } = useSidebar()

  return (
    <div className="grid h-screen grid-rows-[auto_1fr_auto] overflow-hidden">
      <Navbar onMenuToggle={toggle} isMobile={false} />
      <div className="grid grid-cols-[auto_1fr] overflow-hidden">
        <Sidebar state={sidebarState} onToggle={toggle} />
        <MapContainer className="h-full w-full" />
      </div>
      <StatusBar />
    </div>
  )
}
