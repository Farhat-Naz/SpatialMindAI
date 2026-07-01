import { Check, Layers } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { cn } from "@/shared/lib/utils"
import type { BasemapConfig } from "@/features/map/constants/basemaps"

interface LayerSwitcherProps {
  basemaps: readonly BasemapConfig[]
  activeBasemapId: string
  onBasemapChange: (id: string) => void
  className?: string
}

export function LayerSwitcher({
  basemaps,
  activeBasemapId,
  onBasemapChange,
  className,
}: LayerSwitcherProps) {
  const activeBasemap = basemaps.find((b) => b.id === activeBasemapId)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label="Switch basemap"
          className={cn("gap-2", className)}
        >
          <Layers className="h-4 w-4" aria-hidden="true" />
          {activeBasemap?.name ?? "Basemap"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {basemaps.map((basemap) => {
          const isActive = basemap.id === activeBasemapId
          return (
            <DropdownMenuItem
              key={basemap.id}
              onSelect={() => onBasemapChange(basemap.id)}
              className={cn("gap-2", isActive && "font-medium")}
            >
              <Check
                className={cn("h-4 w-4", !isActive && "invisible")}
                aria-hidden="true"
              />
              {basemap.name}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
