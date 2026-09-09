// The welcome letter, on demand, for looking at it.
//
// It normally appears once, to a signed-in guest who has never answered it, which makes it
// the hardest thing on the site to see twice. This page raises the same modal for anybody,
// so the crawl, the song and the wording can be worked on without deleting an account
// first.
//
// Development only: in production it is not a page at all. What it shows is real, though,
// including the button, which does nothing for a visitor who is not signed in.

import { notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"

import { WelcomeLetterModal } from "@/components/WelcomeLetterModal"

export default async function WelcomePreviewPage({
  params,
}: PageProps<"/[locale]/welcome">) {
  const { locale } = await params
  setRequestLocale(locale)

  if (process.env.NODE_ENV === "production") notFound()

  return <WelcomeLetterModal />
}
