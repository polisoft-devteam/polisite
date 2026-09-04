// The sections of a long page, as a row of links across the top.
//
// Mirrors the header's navigation: a bar slides under whichever section you are reading,
// measured rather than guessed so it follows a label that reflowed when the language
// changed. Which section that is comes from an IntersectionObserver, so scrolling moves
// the bar without clicking anything.
//
// Clicking scrolls rather than jumps. The pages still render plain anchors to real ids, so
// a link can be copied and it still works with JavaScript off; the smooth part is an
// enhancement on top.

"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"

import {
  GamingIcon,
  HeartIcon,
  MembersIcon,
  MusicIcon,
  PartyIcon,
  PhotosIcon,
  PlayIcon,
  PlusIcon,
  DriveIcon,
  PendingIcon,
  type IconComponent,
} from "@/lib/icons"
import { cn } from "@/lib/utils"

/**
 * Named rather than passed: only plain data crosses from a Server Component to a Client
 * one, and a React component is not plain data. Same reason EventCategoryField imports
 * its own.
 */
const SUB_NAV_ICON: Record<string, IconComponent> = {
  about: PartyIcon,
  members: MembersIcon,
  timeline: PendingIcon,
  membership: HeartIcon,
  films: PlayIcon,
  albums: PhotosIcon,
  gaming: GamingIcon,
  music: MusicIcon,
  resources: DriveIcon,
  add: PlusIcon,
}

export type SubNavItem = {
  /** The id of the PageSection it jumps to. */
  id: string
  label: string
  /** A key of SUB_NAV_ICON. Left out, the item is just its label. */
  icon?: keyof typeof SUB_NAV_ICON
}

type IndicatorPosition = { left: number; width: number }

export function PageSubNav({ items }: { items: SubNavItem[] }) {
  const navigationRef = useRef<HTMLElement>(null)
  const [activeId, setActiveId] = useState(items[0]?.id ?? "")
  const [indicator, setIndicator] = useState<IndicatorPosition | null>(null)

  const sectionIds = items.map((item) => item.id).join(",")

  // Whichever section is nearest the top of the viewport wins, rather than the first one
  // merely intersecting: two short sections on screen at once would otherwise fight.
  useEffect(() => {
    const sections = sectionIds
      .split(",")
      .filter(Boolean)
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null)

    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (first, second) =>
              first.boundingClientRect.top - second.boundingClientRect.top,
          )

        if (visible[0]) setActiveId(visible[0].target.id)
      },
      // The band is the top of the viewport, just below the sticky header.
      { rootMargin: "-88px 0px -70% 0px" },
    )

    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [sectionIds])

  // Measured after layout, so the bar is in place on the first paint rather than sliding
  // in from the left when the page loads.
  useLayoutEffect(() => {
    const nav = navigationRef.current
    if (!nav) return

    function moveToActiveLink() {
      if (!nav) return
      const active = nav.querySelector<HTMLElement>('[aria-current="true"]')
      if (!active) return setIndicator(null)

      const navBox = nav.getBoundingClientRect()
      const linkBox = active.getBoundingClientRect()
      setIndicator({ left: linkBox.left - navBox.left, width: linkBox.width })
    }

    moveToActiveLink()

    const observer = new ResizeObserver(moveToActiveLink)
    observer.observe(nav)

    return () => observer.disconnect()
  }, [activeId, sectionIds])

  // One section is not a navigation.
  if (items.length < 2) return null

  return (
    <nav
      ref={navigationRef}
      className="border-border relative mt-6 flex flex-wrap gap-1 border-b pb-2"
    >
      {items.map((item) => {
        const isActive = item.id === activeId
        const Icon = item.icon ? SUB_NAV_ICON[item.icon] : undefined

        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={isActive ? "true" : undefined}
            onClick={(event) => {
              const section = document.getElementById(item.id)
              if (!section) return

              // Only take over when we can do it better; otherwise the anchor stands.
              event.preventDefault()
              setActiveId(item.id)
              section.scrollIntoView({ behavior: "smooth", block: "start" })
              history.replaceState(null, "", `#${item.id}`)
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
              isActive
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {Icon && <Icon className="size-3.5" />}
            {item.label}
          </a>
        )
      })}

      {indicator && (
        <span
          aria-hidden="true"
          className="brand-fill-ink absolute -bottom-px h-0.5 rounded-full transition-[left,width] duration-300 ease-out motion-reduce:transition-none"
          style={{ left: indicator.left, width: indicator.width }}
        />
      )}
    </nav>
  )
}
