// A centred pop-up over a dimmed background, with an optional footer for one or two
// buttons. Fades and zooms in and out.
//
// Built on ui/dialog so Base UI handles focus trapping, Escape, scroll locking and ARIA —
// a lot to get right by hand. The close button is ours so it uses the Bootstrap icon.

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CloseIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"

export function Modal({
  trigger,
  title,
  description,
  footer,
  closeLabel,
  className,
  children,
}: {
  trigger: React.ReactNode
  title: string
  /** Read out with the title by screen readers; keep it to a sentence. */
  description?: string
  /** Usually one or two buttons. Put a cancel button in a ModalClose. */
  footer?: React.ReactNode
  /** Accessible name for the X, since the icon alone says nothing. */
  closeLabel: string
  className?: string
  children?: React.ReactNode
}) {
  return (
    <Dialog>
      <DialogTrigger render={trigger as React.ReactElement} />

      <DialogContent
        showCloseButton={false}
        className={cn("sm:max-w-md", className)}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {children}

        {footer && <DialogFooter>{footer}</DialogFooter>}

        <DialogClose
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute top-2 right-2"
              aria-label={closeLabel}
            />
          }
        >
          <CloseIcon className="size-4" />
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}

/** Wrap a button in this to make it dismiss the modal. */
export { DialogClose as ModalClose }
