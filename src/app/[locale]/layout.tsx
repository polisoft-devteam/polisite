import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { notFound } from "next/navigation"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { MembershipPrompt } from "@/components/MembershipPrompt"
import { SiteFooter } from "@/components/SiteFooter"
import { SiteHeader } from "@/components/SiteHeader"
import { ThemeProvider } from "@/components/ThemeProvider"
import { routing } from "@/i18n/routing"
import { ASSOCIATION_NAME } from "@/lib/association"

import "../globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
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
