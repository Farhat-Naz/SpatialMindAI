"use client"

import { Menu } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { ThemeToggle } from "@/features/theme/components/ThemeToggle"
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
      className="flex items-center justify-between gap-2 border-b bg-background px-4 py-2"
    >
      <div className="flex min-w-0 items-center gap-2">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            onClick={onMenuToggle}
            className="shrink-0"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
        )}
        <span className="truncate font-semibold">SpatialMind AI</span>
      </div>
      <Toolbar className="min-w-0" />
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
        {children}
      </div>
    </header>
  )
}
