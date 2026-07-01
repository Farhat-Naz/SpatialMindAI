"use client"

import { Menu } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Toolbar } from "./Toolbar"

interface NavbarProps {
  onMenuToggle: () => void
  isMobile: boolean
  children?: React.ReactNode
}

export function Navbar({ onMenuToggle, isMobile, children }: NavbarProps) {
  return (
    <header
      role="banner"
      className="flex items-center justify-between border-b bg-background px-4 py-2"
    >
      <div className="flex items-center gap-2">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
        )}
        <span className="font-semibold">SpatialMind AI</span>
      </div>
      <Toolbar />
      <div className="flex items-center gap-2">{children}</div>
    </header>
  )
}
