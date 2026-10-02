// The duels: two members, one question, and everyone else picking a side with a reason.
// Several can run at once, one tab each, chosen with ?duel=<id>.
//
// Members only, from the (member) layout: it is members' faces and members' opinions of
// each other.

import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { CompetArena } from "@/components/CompetArena"
import { CompetTabs } from "@/components/CompetTabs"
import { CompetitionForm } from "@/components/CompetitionForm"
import { EmptyState } from "@/components/EmptyState"
import { PageContainer } from "@/components/PageContainer"
import { PageHeading } from "@/components/PageHeading"
import { PageSection } from "@/components/PageSection"
import {
  createCompetitionAction,
  removeCompetitionVoteAction,
  voteInCompetitionAction,
} from "@/features/compet/actions"
import {
  findAllCompetitions,
  findCompetitionVotes,
  findOwnVoteTimes,
} from "@/features/compet/queries"
import { memberDisplayName } from "@/features/members/identity"
import { findActiveMembersForDirectory } from "@/features/members/queries"
import { getViewer } from "@/lib/auth"
import {
  canCreateCompetition,
  canEditCompetitionVote,
  canRemoveCompetitionVote,
} from "@/lib/permissions"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/compet">): Promise<Metadata> {
  const { locale } = await params
  const translateCompet = await getTranslations({ locale, namespace: "Compet" })

  return { title: translateCompet("pageTitle") }
}

export default async function CompetPage({
  params,
  searchParams,
}: PageProps<"/[locale]/compet">) {
  const { locale } = await params
  const { duel } = await searchParams
  setRequestLocale(locale)

  const translateCompet = await getTranslations("Compet")
  const viewer = await getViewer()
  const competitions = await findAllCompetitions()

  // An unknown or stale id falls back to the first tab rather than to nothing.
  const competition =
    competitions.find((candidate) => candidate.id === duel) ??
    competitions[0] ??
    null

  const [votes, ownVoteTimes] = competition
    ? await Promise.all([
        findCompetitionVotes(competition.id),
        findOwnVoteTimes(competition.id, viewer!.member!.id),
      ])
    : [[], []]

  const canCreate = canCreateCompetition(viewer)
  const memberOptions = canCreate
    ? (await findActiveMembersForDirectory()).map((member) => ({
        id: member.id,
        displayName: memberDisplayName(member),
      }))
    : []

  return (
    <PageContainer>
      <div className="mt-8">
        <PageHeading
          isDisplay
          eyebrow={translateCompet("pageEyebrow")}
          title={competition?.question ?? translateCompet("pageTitle")}
        />
      </div>

      {competition && (
        <div className="mt-8">
          <CompetTabs
            competitions={competitions}
            selectedCompetitionId={competition.id}
          />
        </div>
      )}

      <div className="mt-8">
        {competition ? (
          // Keyed by duel, so switching tabs starts the animations and the form afresh.
          <CompetArena
            key={competition.id}
            competition={competition}
            votes={votes}
            ownVoteTimes={ownVoteTimes}
            editableVoteIds={votes
              .filter((vote) =>
                canEditCompetitionVote(viewer, competition, vote),
              )
              .map((vote) => vote.id)}
            removableVoteIds={votes
              .filter((vote) =>
                canRemoveCompetitionVote(viewer, competition, vote),
              )
              .map((vote) => vote.id)}
            removeVoteAction={removeCompetitionVoteAction}
            voteAction={voteInCompetitionAction}
          />
        ) : (
          <EmptyState>{translateCompet("empty")}</EmptyState>
        )}
      </div>

      {canCreate && (
        <PageSection heading={translateCompet("createTitle")}>
          <p className="text-muted-foreground text-sm">
            {translateCompet("createHint")}
          </p>
          {/* Keyed by duel, so landing on the new one's tab clears the form. */}
          <CompetitionForm
            key={competition?.id ?? "first"}
            members={memberOptions}
            createAction={createCompetitionAction}
          />
        </PageSection>
      )}
    </PageContainer>
  )
}
