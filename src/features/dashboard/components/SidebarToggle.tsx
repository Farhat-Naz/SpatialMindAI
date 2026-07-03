import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

interface SidebarToggleProps {
  isExpanded: boolean
  onToggle: () => void
  className?: string
}

export function SidebarToggle({
  isExpanded,
  onToggle,
  className,
}: SidebarToggleProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      aria-expanded={isExpanded}
      aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
      className={cn(className)}
    >
      {isExpanded ? <ChevronLeft /> : <ChevronRight />}
    </Button>
  )
}
