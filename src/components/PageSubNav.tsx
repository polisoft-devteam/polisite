// The sections of a long page, as a row of links across the top.
//
// Plain anchors to ids on the same page, so it needs no JavaScript and a link can be
// copied and shared. Pages decide their own items, and leave out the ones a given viewer
// cannot see, so this never points at a section that is not there.

export type SubNavItem = {
  /** The id of the PageSection it jumps to. */
  id: string
  label: string
}

export function PageSubNav({ items }: { items: SubNavItem[] }) {
  // One section is not a navigation.
  if (items.length < 2) return null

  return (
    <nav className="border-border mt-6 flex flex-wrap gap-1 border-b pb-2">
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
        >
          {item.label}
        </a>
      ))}
    </nav>
  )
}
