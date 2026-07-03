import type { SidebarState } from "@/shared/types/common.types"
import { cn } from "@/shared/lib/utils"
import { SidebarToggle } from "./SidebarToggle"

interface SidebarProps {
  state: SidebarState
  onToggle: () => void
  children?: React.ReactNode
}

export function Sidebar({ state, onToggle, children }: SidebarProps) {
  const isExpanded = state === "expanded"

  return (
    <aside
      aria-label="Main navigation"
      className={cn(
        "flex flex-col overflow-hidden transition-[width] duration-300 ease-in-out",
        isExpanded ? "w-64" : "w-14"
      )}
    >
      {children}
      <SidebarToggle isExpanded={isExpanded} onToggle={onToggle} className="mt-auto" />
    </aside>
  )
}
