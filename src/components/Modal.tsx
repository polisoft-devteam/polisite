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
import { SiteImage } from "@/components/SiteImage"
import { Button } from "@/components/ui/button"
import { CloseIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"

export function Modal({
  trigger,
  defaultOpen = false,
  title,
  description,
  footer,
  closeLabel,
  backgroundImage,
  titleClassName,
  className,
  children,
}: {
  /** Omit for a modal that opens on its own. */
  trigger?: React.ReactNode
  /** Opens as soon as it renders — for a welcome or announcement. */
  defaultOpen?: boolean
  title: string
  /** Read out with the title by screen readers; keep it to a sentence. */
  description?: string
  /** Usually one or two buttons. Put a cancel button in a ModalClose. */
  footer?: React.ReactNode
  /** Accessible name for the X, since the icon alone says nothing. */
  closeLabel: string
  /**
   * A photograph behind the whole modal, under a wash of the panel colour so the text
   * stays readable in either theme.
   */
  backgroundImage?: string
  /** For a title that needs to sit differently, like the crawl's centred one. */
  titleClassName?: string
  className?: string
  children?: React.ReactNode
}) {
  return (
    <Dialog defaultOpen={defaultOpen}>
      {trigger && <DialogTrigger render={trigger as React.ReactElement} />}

      <DialogContent
        showCloseButton={false}
        className={cn(
          "sm:max-w-md",
          // isolate so the negative-z layers below paint above the panel's own
          // background rather than behind it, and clipped so they follow the rounding.
          backgroundImage && "isolate overflow-hidden",
          className,
        )}
      >
        {backgroundImage && (
          <>
            <SiteImage
              src={backgroundImage}
              alt=""
              rounded=""
              className="absolute inset-0 -z-10 size-full"
              sizes="(min-width: 640px) 32rem, 100vw"
            />
            <div
              aria-hidden="true"
              className="bg-popover/85 absolute inset-0 -z-10"
            />
          </>
        )}

        <DialogHeader>
          <DialogTitle className={cn("font-bold", titleClassName)}>
            {title}
          </DialogTitle>
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
