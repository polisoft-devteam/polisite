// A bordered list with dividers — events, attendees, members.
// Rows are <li>; use ItemRow for the standard label-and-detail layout.

export function ItemList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="divide-border bg-card divide-y overflow-hidden rounded-lg border">
      {children}
    </ul>
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
