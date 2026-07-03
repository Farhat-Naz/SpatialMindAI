import { Moon, Sun } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"
import { useTheme } from "@/features/theme/hooks/useTheme"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { toggle, isDark } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label="Toggle dark mode"
      className={cn(className)}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  )
}
