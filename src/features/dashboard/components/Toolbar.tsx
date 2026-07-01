import { cn } from "@/shared/lib/utils"

interface ToolbarProps {
  children?: React.ReactNode
  className?: string
}

export function Toolbar({ children, className }: ToolbarProps) {
  return (
    <nav aria-label="Toolbar" className={cn("flex items-center gap-2", className)}>
      {children}
    </nav>
  )
}
