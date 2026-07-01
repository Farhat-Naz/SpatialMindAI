"use client"

import { Navbar } from "./Navbar"
import { StatusBar } from "./StatusBar"
import { MapContainer } from "@/features/map"

export function DashboardLayout() {
  return (
    <div className="grid h-screen grid-rows-[auto_1fr_auto] overflow-hidden">
      <Navbar onMenuToggle={() => {}} isMobile={false} />
      <div className="grid grid-cols-[auto_1fr] overflow-hidden">
        <aside className="w-64 border-r bg-background" />
        <MapContainer className="h-full w-full" />
      </div>
      <StatusBar />
    </div>
  )
}
