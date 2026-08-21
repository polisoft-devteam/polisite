// A link out to another site. Always gets rel="noreferrer noopener", which is easy to
// forget when writing anchors by hand.

export function ExternalLink({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={className ?? "underline underline-offset-4"}
    >
      {children}
    </a>
  )
}
