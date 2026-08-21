// The "← back" link at the top of a detail or form page.
// The negative margin pulls it flush with the page edge, which is why it isn't hand-rolled.

import { ArrowLeftIcon } from "@/lib/icons"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"

export function BackLink({
  href,
  children,
}: {
  href: React.ComponentProps<typeof Link>["href"]
  children: React.ReactNode
}) {
  return (
    <Button
      nativeButton={false}
      render={<Link href={href} transitionTypes={["nav-back"]} />}
      variant="ghost"
      size="sm"
      className="-ml-3"
    >
      <ArrowLeftIcon className="size-4" />
      {children}
    </Button>
  )
}
