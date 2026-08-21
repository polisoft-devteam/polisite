// A section within a page: heading plus content, with consistent spacing above it.

import { SectionHeading } from "@/components/SectionHeading"

export function PageSection({
  heading,
  children,
}: {
  heading?: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-12 space-y-4">
      {heading && <SectionHeading>{heading}</SectionHeading>}
      {children}
    </section>
  )
}
