// Shown where a list would be if it had anything in it.

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-sm">
      {children}
    </p>
  )
}
