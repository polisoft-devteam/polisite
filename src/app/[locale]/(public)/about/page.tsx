// Who the association is: its history, its members, and eventually its timeline.
//
// Public, but not uniformly. The members table is a list of real people, so only members
// see it, and the timeline is admin only until it names real years. Both are left out of
// the sub navigation as well as the page, so it never points at a section that is not
// there.

import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { AssociationTimeline } from "@/components/AssociationTimeline"
import { ImageStack } from "@/components/ImageStack"
import { MembersTable } from "@/components/MembersTable"
import { PageContainer } from "@/components/PageContainer"
import { PageHeading } from "@/components/PageHeading"
import { PageSection } from "@/components/PageSection"
import { PageSubNav, type SubNavItem } from "@/components/PageSubNav"
import { Badge } from "@/components/ui/badge"
import { readAboutImages } from "@/lib/site-images"
import { getViewer } from "@/lib/auth"
import { ASSOCIATION_FULL_NAME } from "@/lib/association"
import { canViewMemberDirectory, isAdmin } from "@/lib/permissions"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params
  const translateAbout = await getTranslations({ locale, namespace: "About" })

  return { title: translateAbout("title") }
}

export default async function AboutPage({
  params,
}: PageProps<"/[locale]/about">) {
  const { locale } = await params
  setRequestLocale(locale)

  const translateAbout = await getTranslations("About")
  const translateMembers = await getTranslations("Members")
  const viewer = await getViewer()
  const aboutImages = await readAboutImages()

  const showMembers = canViewMemberDirectory(viewer)
  const showTimeline = isAdmin(viewer)

  const sections: SubNavItem[] = [
    { id: "about-us", label: translateAbout("aboutHeading") },
    ...(showMembers
      ? [{ id: "members", label: translateMembers("title") }]
      : []),
    ...(showTimeline
      ? [{ id: "timeline", label: translateAbout("timelineHeading") }]
      : []),
    { id: "membership", label: translateAbout("membershipTitle") },
  ]

  return (
    <PageContainer>
      <PageHeading title={ASSOCIATION_FULL_NAME} />

      <PageSubNav items={sections} />

      <PageSection id="about-us">
        {/* The pile sits to the right of the history from md up, and under it on a phone,
            where a column narrow enough for both would leave neither readable. */}
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_14rem] md:items-start">
          <div>
            <p className="font-medium">{translateAbout("motto")}</p>

            {/* The association's own history, in the order it happened. Named keys rather
                than an array, so a paragraph can be reworded without renumbering. */}
            <div className="text-muted-foreground mt-4 space-y-4">
              <p>{translateAbout("origin")}</p>
              <p>{translateAbout("growth")}</p>
              <p>{translateAbout("arrivals")}</p>
              <p>{translateAbout("guests")}</p>
              <p>{translateAbout("bond")}</p>
            </div>
          </div>

          {/* On a phone the pile follows the history rather than leading it, and stays
              small: a full width one pushed the text off the first screen. */}
          {aboutImages.length > 0 && (
            <div className="max-w-40 md:max-w-none">
              <ImageStack images={aboutImages} layout="cascade" />
            </div>
          )}
        </div>
      </PageSection>

      {showMembers && (
        <PageSection id="members" heading={translateMembers("title")}>
          <MembersTable />
        </PageSection>
      )}

      {/* Admins only until it names real years and events. Kept in the page rather than
          commented out, so it is still being looked at while it is being written. Its copy
          is not secret: every message file is shipped to the browser either way. */}
      {showTimeline && (
        <PageSection id="timeline" heading={translateAbout("timelineHeading")}>
          <Badge variant="outline">
            {translateAbout("timelineUnderConstruction")}
          </Badge>

          <AssociationTimeline />
        </PageSection>
      )}

      <PageSection id="membership" heading={translateAbout("membershipTitle")}>
        <p className="text-muted-foreground max-w-2xl">
          {translateAbout("membershipBody")}
        </p>
      </PageSection>
    </PageContainer>
  )
}
