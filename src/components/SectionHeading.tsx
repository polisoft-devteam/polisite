// The h2 that opens a section within a page.

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-heading text-lg font-bold tracking-tight">
      {children}
    </h2>
  )
}
