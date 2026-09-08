// A URL that matches no route at all, which is the one 404 that never reaches a locale.
//
// global-not-found rather than not-found: Next skips its normal rendering for this file,
// so it must bring its own document, its own stylesheet and its own fonts, and in return
// nothing wraps it. As plain not-found.tsx it was wrapped in a default layout whose <html>
// fought with ours and hydration failed. It is behind experimental.globalNotFound in
// next.config.ts.
//
// There is no provider and no messages out here, so the copy is Swedish and hardcoded, as
// it is in global-error.tsx. Anything under /sv or /en that calls notFound() gets the
// translated screen in [locale]/not-found.tsx instead.

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

export default function GlobalNotFound() {
  return (
    <html
      lang="sv"
      className={`${bodyFont.variable} ${headingFont.variable} antialiased`}
    >
      <body className="bg-background text-foreground">
        <ErrorScreen
          code="404"
          title="Ojoj!"
          body="Nu kom du lidt galt, men kryp du ner här så länge tills du hittat rätt."
          actions={
            <Button
              nativeButton={false}
              className="bg-info text-background hover:bg-info/90"
              /* eslint-disable-next-line @next/next/no-html-link-for-pages */
              render={<a href="/" />}
            >
              <span aria-hidden="true">&larr;</span>
              Till startsidan
            </Button>
          }
        />
      </body>
    </html>
  )
}
