// What a member sees when something has gone wrong: the code over a photograph, a line
// about it, and the way back.
//
// The photograph is a background image rather than a SiteImage on purpose. These screens
// render when things are already broken, sometimes with no database and no translations,
// and a missing file behind a CSS background is an empty background rather than a broken
// image icon.
//
// Two layers over it and nothing else: the picture dimmed enough for text to sit on, and
// the palette's blue fogging up from the foot. Two alternatives were tried and both were
// worse.
//
// The words rise in one after another; see .error-rise in globals.css.
// Showing the photograph whole left bars down the sides, and running the letters in a
// brand gradient read as a smudge at that size. Plain ink on a dimmed picture is the
// version that works.
//
// No server APIs and no hooks, so the same screen serves an error boundary, which must be
// a client component, and a not-found page, which is not.

import { cn } from "@/lib/utils"

export function ErrorScreen({
  code,
  title,
  body,
  actions,
  className,
}: {
  /** 404, 500. Shown as large as it will go, because it is the one fact we are sure of. */
  code: string
  title: string
  body: string
  /** A link home, a button to try again. */
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <main
      className={cn(
        "from-primary/25 via-background to-background relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden bg-gradient-to-b px-6 py-16 text-center",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-40"
        style={{ backgroundImage: "url('/images/errors/error-page.webp')" }}
      />

      {/* Blue rising from the foot, so the words have something to sit on. Half the
          height it used to be: enough to read against, little enough to still see the
          picture. --info is the palette's own blue, the one a notice already uses. */}
      <div
        aria-hidden="true"
        // Placed by its edges rather than given a height: the parent has a min-height and
        // no height, so a percentage height resolves to auto, and the fog was nothing at
        // all.
        className="from-info/70 via-info/25 absolute inset-x-0 top-1/2 bottom-0 -z-10 bg-gradient-to-t to-transparent"
      />

      <p className="text-info error-rise font-heading text-9xl leading-none font-extrabold tracking-tight sm:text-[13rem]">
        {code}
      </p>

      <h1
        className="error-rise font-heading mt-4 text-3xl font-extrabold tracking-tight text-balance text-white drop-shadow-md sm:text-4xl"
        style={{ animationDelay: "120ms" }}
      >
        {title}
      </h1>

      <p
        className="error-rise mt-4 max-w-prose text-2xl font-medium text-balance text-white drop-shadow-md sm:text-3xl"
        style={{ animationDelay: "240ms" }}
      >
        {body}
      </p>

      {actions && (
        <div
          className="error-rise mt-8 flex flex-wrap gap-3"
          style={{ animationDelay: "360ms" }}
        >
          {actions}
        </div>
      )}
    </main>
  )
}
