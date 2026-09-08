// Val 2026: the wheel, full size, and what it has done to everyone else.
//
// Public like the front page, because anybody may spin. The standings are not: they are
// the association's own faces, and who is a member is members' business — the same rule
// the directory follows.

import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { ElectionResults } from "@/components/ElectionResults"
import { ElectionWheel } from "@/components/ElectionWheel"
import { EmptyState } from "@/components/EmptyState"
import { PageContainer } from "@/components/PageContainer"
import { PageHeading } from "@/components/PageHeading"
import { PhotoHero } from "@/components/PhotoHero"
import { PageSection } from "@/components/PageSection"
import { SignInButton } from "@/components/SignInButton"
import { recordElectionPickAction } from "@/features/election/actions"
import { findElectionVotes } from "@/features/election/queries"
import { viewerAvatarUrl, viewerDisplayName } from "@/features/members/identity"
import { getViewer } from "@/lib/auth"
import { isElectionOpen, SPINS_ON_FIRST_DAY } from "@/lib/election"
import { canViewMemberDirectory, isActiveMember } from "@/lib/permissions"
import { readElectionImages, readPartyImages } from "@/lib/site-images"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/election">): Promise<Metadata> {
  const { locale } = await params
  const translateElection = await getTranslations({
    locale,
    namespace: "Election",
  })

  return { title: translateElection("pageTitle") }
}

export default async function ElectionPage({
  params,
}: PageProps<"/[locale]/election">) {
  const { locale } = await params
  setRequestLocale(locale)

  const translateElection = await getTranslations("Election")
  const viewer = await getViewer()

  const canSeeResults = canViewMemberDirectory(viewer)

  const [votes, partyLogos, heroImages] = await Promise.all([
    canSeeResults ? findElectionVotes() : [],
    readPartyImages(),
    readElectionImages(),
  ])

  const intro = isElectionOpen()
    ? translateElection("pageIntro")
    : translateElection("pageClosed")

  return (
    <>
      {/* A photograph if anybody has dropped one into public/images/election, and the
          plain heading until they have. */}
      {heroImages.length > 0 && (
        <PhotoHero
          images={heroImages}
          eyebrow={translateElection("pageEyebrow")}
          title={translateElection("pageTitle")}
          tagline={intro}
          strongTagline
        />
      )}

      <PageContainer belowHero={heroImages.length > 0}>
        {heroImages.length === 0 && (
          <>
            <div className="mt-4">
              <PageHeading
                eyebrow={translateElection("pageEyebrow")}
                title={translateElection("pageTitle")}
              />
            </div>

            <p className="text-muted-foreground mt-4 max-w-prose text-sm">
              {intro}
            </p>
          </>
        )}

        {isElectionOpen() && (
          <div className="mt-8">
            <ElectionWheel
              placement="page"
              identity={
                isActiveMember(viewer)
                  ? `member:${viewer!.member!.id}`
                  : viewer
                    ? "signedIn"
                    : "guest"
              }
              maxSpins={SPINS_ON_FIRST_DAY}
              isSignedOut={!viewer}
              viewerName={viewer ? viewerDisplayName(viewer) : null}
              viewerAvatarUrl={viewer ? viewerAvatarUrl(viewer) : null}
              recordPick={
                isActiveMember(viewer) ? recordElectionPickAction : undefined
              }
            />

            {/* The wheel is there to be looked at either way. The spin is the part that
                needs a name behind it. */}
            {!viewer && (
              <div className="mt-6 flex flex-col items-center gap-2">
                <p className="text-muted-foreground text-sm">
                  {translateElection("signInToSpin")}
                </p>
                <SignInButton />
              </div>
            )}
          </div>
        )}

        <PageSection heading={translateElection("standingsTitle")}>
          {canSeeResults ? (
            <ElectionResults
              votes={votes}
              partyLogos={partyLogos}
              emptyText={translateElection("standingsEmpty")}
              voteCountLabel={(count) =>
                translateElection("voteCount", { count })
              }
            />
          ) : (
            /* The standings are the association's own faces, so a visitor is told they
             exist and nothing more. */
            <EmptyState>{translateElection("standingsMembersOnly")}</EmptyState>
          )}
        </PageSection>
      </PageContainer>
    </>
  )
}
