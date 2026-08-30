// A media card for someone who isn't a member: the cover and the title, and a modal
// explaining why it doesn't open.
//
// The point is what this component does not receive. The album's share URL and the film's
// video id never get passed in, so they are absent from the page rather than hidden in
// it. Inspecting the markup finds nothing to copy.

"use client"

import { useTranslations } from "next-intl"

import { Modal } from "@/components/Modal"
import { SiteImage } from "@/components/SiteImage"
import { LockIcon } from "@/lib/icons"

export function LockedMediaCard({
  label,
  coverUrl,
  caption,
}: {
  label: string
  coverUrl?: string
  caption?: string
}) {
  const translateArchive = useTranslations("Archive")

  return (
    <Modal
      title={translateArchive("membersOnlyTitle")}
      description={translateArchive("membersOnlyBody")}
      closeLabel={translateArchive("membersOnlyClose")}
      trigger={
        <button
          type="button"
          aria-label={`${label}. ${translateArchive("membersOnlyTitle")}`}
          className="group border-border bg-card focus-visible:ring-ring/50 block w-full cursor-pointer overflow-hidden rounded-xl border text-left shadow-sm transition-shadow hover:shadow-lg focus-visible:ring-3 focus-visible:outline-none"
        >
          <span className="relative block overflow-hidden">
            {coverUrl ? (
              <SiteImage
                src={coverUrl}
                alt=""
                rounded=""
                className="aspect-16/9 w-full"
                sizes="(min-width: 1024px) 16rem, (min-width: 640px) 30vw, 100vw"
              />
            ) : (
              <span className="from-primary/25 via-card to-accent/25 block aspect-16/9 w-full bg-linear-135" />
            )}

            <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/55 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
              <LockIcon className="size-6" />
              <span className="px-3 text-center text-xs font-medium">
                {translateArchive("membersOnlyHint")}
              </span>
            </span>
          </span>

          <span className="block px-3 py-2.5">
            <span className="font-heading block truncate text-sm font-bold tracking-tight">
              {label}
            </span>
            {caption && (
              <span className="text-muted-foreground block truncate text-xs">
                {caption}
              </span>
            )}
          </span>
        </button>
      }
    />
  )
}
