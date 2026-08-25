// A link out to another site.
//
// Always gets rel="noreferrer noopener", which is easy to forget by hand, and the shared
// link colour — content links should read as links without shouting.

import { cn } from "@/lib/utils"

export const EXTERNAL_LINK_CLASSES =
  "text-primary decoration-primary/40 hover:decoration-primary inline-flex items-center gap-1.5 font-medium underline underline-offset-4 transition-colors"

export function ExternalLink({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(EXTERNAL_LINK_CLASSES, className)}
    >
      {children}
    </a>
  )
}
