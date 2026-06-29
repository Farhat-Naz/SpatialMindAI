import { Loader2 } from "lucide-react"
import { cn } from "@/shared/lib/utils"

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
} as const

interface LoadingSpinnerProps {
  size?: keyof typeof sizeClasses
  label?: string
  className?: string
}

export function LoadingSpinner({
  size = "md",
  label = "Loading…",
  className,
}: LoadingSpinnerProps) {
  return (
    <span role="status" aria-label={label} className={cn("inline-flex", className)}>
      <Loader2 className={cn("animate-spin text-current", sizeClasses[size])} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  )
}
