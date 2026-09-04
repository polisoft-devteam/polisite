import type { Metadata } from "next"
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google"
import { notFound } from "next/navigation"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { PaletteLoader } from "@/components/PaletteLoader"
import { MembershipPrompt } from "@/components/MembershipPrompt"
import { SiteFooter } from "@/components/SiteFooter"
import { SiteHeader } from "@/components/SiteHeader"
import { ThemeProvider } from "@/components/ThemeProvider"
import { routing } from "@/i18n/routing"
import { ASSOCIATION_NAME } from "@/lib/association"
import { getSiteUrl } from "@/lib/site-url"

import "../globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

// Headings. Enough character to sound like a club rather than a publication, set heavy
// so titles carry weight against plain body text.
// Self-hosted by next/font — no request to Google at runtime.
const headingFont = Bricolage_Grotesque({
  variable: "--font-heading-family",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
})

// Lets Next build /sv and /en ahead of time instead of on first request.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params
  const translateSite = await getTranslations({ locale, namespace: "Site" })

  return {
    // Makes canonical and share URLs absolute. Without it Next builds them relative and
    // they resolve against whatever host served the page.
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: ASSOCIATION_NAME,
      template: `%s · ${ASSOCIATION_NAME}`,
    },
    description: translateSite("tagline"),
  }
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params

  // Guards against someone hand-typing /de and getting a half-translated page.
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${headingFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>
          {/* No disableTransitionOnChange: it injects `transition: none` on everything
              while the theme switches, which also flattens the toggle's own animation. */}
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {/* Puts a palette experiment back on after a reload; see PaletteLoader.
                Renders nothing unless somebody is trying a colour. */}
            <PaletteLoader />
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <MembershipPrompt />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
