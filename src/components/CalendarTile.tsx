// One thing on one day in the month grid.
//
// An event wears its own photograph as a background with the title over it, cropped to a
// letterbox so only a slice shows, which is the point: it makes a month of squares
// recognisable at a glance rather than a wall of identical pills. Hovering zooms the
// photograph inside its box rather than growing the box, so the grid never reflows.
//
// A birthday is the same shape with the member's own picture, so both read as "something
// is happening" without needing a legend.

import { SiteImage } from "@/components/SiteImage"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

export function CalendarTile({
  href,
  imageUrl,
  lead,
  title,
  tone = "event",
}: {
  /** Omitted for a birthday, which has nowhere to go. */
  href?: string
  imageUrl: string | null
  /** The time, or a cake. Sits before the title. */
  lead?: string
  title: string
  tone?: "event" | "birthday"
}) {
  const body = (
    <>
      {imageUrl ? (
        <>
          <SiteImage
            src={imageUrl}
            alt=""
            rounded=""
            className="absolute inset-0 size-full transition-transform duration-500 ease-out group-hover/tile:scale-125 motion-reduce:transition-none"
            sizes="8rem"
          />
          {/* Dark enough for white text over any photograph. */}
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-t from-black/85 via-black/45 to-black/20"
          />
        </>
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0",
            tone === "birthday" ? "bg-notification/20" : "bg-primary/15",
          )}
        />
      )}

      <span
        className={cn(
          "relative block truncate px-1.5 py-1 text-[11px] leading-tight",
          imageUrl ? "font-medium text-white drop-shadow" : "text-foreground",
        )}
      >
        {lead ? `${lead} ` : null}
        {title}
      </span>
    </>
  )

  const shell = "group/tile relative flex h-9 items-end overflow-hidden rounded"

  if (!href) {
    return (
      <span className={shell} title={title}>
        {body}
      </span>
    )
  }

  return (
    <Link
      href={href}
      transitionTypes={["nav-forward"]}
      title={title}
      className={cn(shell, "hover:ring-primary/40 hover:ring-2")}
    >
      {body}
    </Link>
  )
}
