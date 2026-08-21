// Every image on the site goes through here: a pulsing skeleton that the photo covers
// once decoded, plus Next's optimisation so a 4 MB phone photo isn't served as-is.
//
// Hosts allowed for optimisation are listed in next.config.ts.

import Image from "next/image"

import { cn } from "@/lib/utils"

export function SiteImage({
  src,
  alt,
  className,
  sizes = "100vw",
  priority = false,
  rounded = "rounded-lg",
}: {
  src: string
  /** Empty string for decorative images the surrounding text already names. */
  alt: string
  /** Must establish a size — an aspect ratio, or a fixed width and height. */
  className?: string
  /** Tells the browser how wide this renders, so it picks the right file. */
  sizes?: string
  /** Set on the one image above the fold; it skips lazy loading. */
  priority?: boolean
  rounded?: string
}) {
  return (
    <span
      className={cn(
        "bg-muted relative block overflow-hidden",
        rounded,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="bg-muted-foreground/20 absolute inset-0 animate-pulse"
      />
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </span>
  )
}
