import { Sheet, SheetContent } from "@/shared/components/ui/sheet"

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
  children?: React.ReactNode
}

export function MobileNav({ isOpen, onClose, children }: MobileNavProps) {
  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <SheetContent side="left">{children}</SheetContent>
    </Sheet>
  )
}
