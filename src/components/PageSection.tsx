// A section within a page: heading plus content, with consistent spacing above it.
//
// An id makes it a target for PageSubNav. scroll-mt keeps the heading clear of the sticky
// header when jumped to, rather than tucked underneath it.

import { SectionHeading } from "@/components/SectionHeading"

export function PageSection({
  heading,
  id,
  children,
}: {
  heading?: string
  /** Set when the page has a sub navigation pointing at this section. */
  id?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-24 space-y-4">
      {heading && <SectionHeading>{heading}</SectionHeading>}
      {children}
    </section>
  )
}
