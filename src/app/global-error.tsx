// The last resort: something threw in the root layout itself, so there is no header, no
// footer, no theme and no translations to reach for.
//
// It has to render its own <html> and <body>, because it replaces the whole document. The
// copy is Swedish and hardcoded for the same reason: whatever loads the messages is part
// of what has already failed. Exactly what today's outage looked like, when every page
// that touched the database went down at once.

"use client"

import { Bricolage_Grotesque, Geist } from "next/font/google"

import "./globals.css"

// The stylesheet and the fonts, again: this renders its own document, outside the layout
// that loads them for every other page. Without this the screen arrives as unstyled text
// on white, which is how a broken site looks even more broken than it is.
const bodyFont = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const headingFont = Bricolage_Grotesque({
  variable: "--font-heading-family",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
})

import { ErrorScreen } from "@/components/ErrorScreen"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  return (
    <html
      lang="sv"
      className={`${bodyFont.variable} ${headingFont.variable} antialiased`}
    >
      <body className="bg-background text-foreground">
        <ErrorScreen
          code="500"
          title="Något gick sönder"
          body="Sidan kunde inte laddas. Ladda om, eller försök igen om en stund."
          actions={
            <>
              {/* Our own button, rendering a plain anchor: the app shell is what failed,
                  so handing this to the client router would ask the broken thing to fix
                  itself, and out here there is no provider for a language-aware Link. */}
              <Button
                nativeButton={false}
                className="bg-info text-background hover:bg-info/90"
                /* eslint-disable-next-line @next/next/no-html-link-for-pages */
                render={<a href="/" />}
              >
                <span aria-hidden="true">&larr;</span>
                Till startsidan
              </Button>

              {error.digest && (
                <span className="text-muted-foreground self-center font-mono text-xs">
                  {error.digest}
                </span>
              )}
            </>
          }
        />
      </body>
    </html>
  )
}
