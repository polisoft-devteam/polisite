// Lists of things — events, attendees, members, poll options.
//
// Two shapes, because they read differently:
//   ItemList     one bordered box, rows separated by dividers. For dense lists.
//   StackedList  separate bordered cards with a gap. For rows that carry their own
//                background, like the poll bars.
//
// Rows are <li>; ItemRow gives the standard label-and-detail layout.

export function ItemList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="divide-border bg-card divide-y overflow-hidden rounded-lg border">
      {children}
    </ul>
  )
}

export function StackedList({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-3">{children}</ul>
}

/** A card within a StackedList. Handles the border, rounding and clipping. */
export function StackedListItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <li
      className={
        className ??
        "border-border bg-card relative overflow-hidden rounded-lg border p-4"
      }
    >
      {children}
    </li>
  )
}

export function ItemRow({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <li className={className ?? "flex justify-between gap-4 p-4"}>
      {children}
    </li>
  )
}
