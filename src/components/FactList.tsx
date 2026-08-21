// A short definition list — "Startar: lördag 4 oktober". Used on events and profiles.

export function FactList({ children }: { children: React.ReactNode }) {
  return <dl className="space-y-1 text-sm">{children}</dl>
}

export function Fact({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <dt className="text-muted-foreground">{label}:</dt>
      <dd>{children}</dd>
    </div>
  )
}
