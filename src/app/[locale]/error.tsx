// Anything that throws while rendering a page under /sv or /en lands here.
//
// A client component, because that is what an error boundary has to be, and because
// trying again is a button rather than a link. The layout above it has already rendered,
// so the header, the footer and the translations are all in hand.
//
// An error in the layout itself is caught by global-error.tsx instead, which has none of
// those and says so.

"use client"

import { useTranslations } from "next-intl"

import { ErrorScreen } from "@/components/ErrorScreen"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { ArrowLeftIcon, ReplayIcon } from "@/lib/icons"

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const translateErrors = useTranslations("Errors")

  return (
    <ErrorScreen
      code="500"
      title={translateErrors("serverTitle")}
      body={translateErrors("serverBody")}
      actions={
        <>
          <Button onClick={reset}>
            <ReplayIcon className="size-4" />
            {translateErrors("retry")}
          </Button>

          <Button
            nativeButton={false}
            className="bg-info text-background hover:bg-info/90"
            render={<Link href="/" />}
          >
            <ArrowLeftIcon className="size-4" />
            {translateErrors("home")}
          </Button>

          {/* The one thing worth reading out of an error: it is what finds the request in
              the deployment's logs. */}
          {error.digest && (
            <span className="text-muted-foreground self-center font-mono text-xs">
              {error.digest}
            </span>
          )}
        </>
      }
    />
  )
}
