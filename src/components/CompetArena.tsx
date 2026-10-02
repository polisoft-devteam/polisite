// The duel on /compet: two faces with VS between them, a pillar each, and the reasons
// people gave stacked on the side they voted for.
//
// The page re-fetches every few seconds, so other people's votes arrive without a reload.
// A vote this component has not seen before is what sets off the effects: its reason flies
// in from the form, its pillar jumps, and a ring bursts off the contender it went to.

"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"

import { CompetVoteForm } from "@/components/CompetVoteForm"
import { StackedList, StackedListItem } from "@/components/ItemList"
import { MemberAvatar } from "@/components/MemberAvatar"
import { SiteImage } from "@/components/SiteImage"
import type {
  CompetContender,
  CompetVote,
  CurrentCompetition,
} from "@/features/compet/queries"
import type { CompetFormResult } from "@/features/compet/actions"
import { useRouter } from "@/i18n/navigation"
import { competShares } from "@/lib/compet"
import { cn } from "@/lib/utils"

type CompetSide = "left" | "right"

const REFRESH_MILLISECONDS = 8000

const SIDE_STYLES = {
  left: {
    fill: "bg-compet-left",
    text: "text-compet-left",
    ring: "ring-compet-left",
    border: "border-l-compet-left border-l-4",
    wash: "bg-compet-left/25",
  },
  right: {
    fill: "bg-compet-right",
    text: "text-compet-right",
    ring: "ring-compet-right",
    border: "border-r-compet-right border-r-4",
    wash: "bg-compet-right/25",
  },
} as const

export function CompetArena({
  competition,
  votes,
  ownVoteTimes,
  voteAction,
}: {
  competition: CurrentCompetition
  /** Newest first. */
  votes: CompetVote[]
  ownVoteTimes: Date[]
  voteAction: (
    previous: CompetFormResult,
    formData: FormData,
  ) => Promise<CompetFormResult>
}) {
  const translateCompet = useTranslations("Compet")
  const router = useRouter()

  // Votes already on the page when it loaded don't fly in; only ones that arrive after.
  const [knownVoteIds, setKnownVoteIds] = useState(
    () => new Set(votes.map((vote) => vote.id)),
  )
  const [landingVoteIds, setLandingVoteIds] = useState<Set<string>>(new Set())
  const [hitCounts, setHitCounts] = useState({ left: 0, right: 0 })

  const sideOf = (vote: CompetVote): CompetSide =>
    vote.votedForMemberId === competition.left.memberId ? "left" : "right"

  // Adjusted during render rather than in an effect, so the new reason is already flying
  // on the first paint that contains it instead of flashing in place first.
  const arrivedVotes = votes.filter((vote) => !knownVoteIds.has(vote.id))
  if (arrivedVotes.length > 0) {
    setKnownVoteIds(new Set(votes.map((vote) => vote.id)))
    setLandingVoteIds(new Set(arrivedVotes.map((vote) => vote.id)))
    setHitCounts((counts) => ({
      left:
        counts.left +
        arrivedVotes.filter((vote) => sideOf(vote) === "left").length,
      right:
        counts.right +
        arrivedVotes.filter((vote) => sideOf(vote) === "right").length,
    }))
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh()
    }, REFRESH_MILLISECONDS)

    return () => window.clearInterval(timer)
  }, [router])

  const leftVotes = votes.filter((vote) => sideOf(vote) === "left")
  const rightVotes = votes.filter((vote) => sideOf(vote) === "right")
  const shares = competShares(leftVotes.length, rightVotes.length)

  return (
    <div className="space-y-10">
      <div className="bg-card relative grid grid-cols-2 overflow-hidden rounded-2xl border">
        <ContenderCorner
          side="left"
          contender={competition.left}
          hitCount={hitCounts.left}
        />
        <ContenderCorner
          side="right"
          contender={competition.right}
          hitCount={hitCounts.right}
        />

        <span
          aria-hidden="true"
          className="compet-versus bg-background font-heading absolute top-1/2 left-1/2 -mt-8 -ml-8 flex size-16 items-center justify-center rounded-full border-2 text-2xl font-extrabold sm:-mt-10 sm:-ml-10 sm:size-20 sm:text-3xl"
        >
          {translateCompet("versus")}
        </span>
      </div>

      {/* Two columns of reasons with the pillars between them, and on a phone the pillars
          first and the reasons in two columns beneath. */}
      <div className="grid grid-cols-2 items-start gap-4 md:grid-cols-[1fr_auto_1fr] md:gap-8">
        <ReasonColumn
          side="left"
          contender={competition.left}
          votes={leftVotes}
          landingVoteIds={landingVoteIds}
        />

        <div className="order-first col-span-2 flex justify-center gap-6 md:order-none md:col-span-1">
          <Pillar
            side="left"
            share={shares.left}
            voteCount={leftVotes.length}
            hitCount={hitCounts.left}
          />
          <Pillar
            side="right"
            share={shares.right}
            voteCount={rightVotes.length}
            hitCount={hitCounts.right}
          />
        </div>

        <ReasonColumn
          side="right"
          contender={competition.right}
          votes={rightVotes}
          landingVoteIds={landingVoteIds}
        />
      </div>

      {votes.length === 0 && (
        <p className="text-muted-foreground text-center text-sm">
          {translateCompet("noVotes")}
        </p>
      )}

      <CompetVoteForm
        competition={competition}
        ownVoteTimes={ownVoteTimes}
        voteAction={voteAction}
      />
    </div>
  )
}

function ContenderCorner({
  side,
  contender,
  hitCount,
}: {
  side: CompetSide
  contender: CompetContender
  hitCount: number
}) {
  const styles = SIDE_STYLES[side]

  return (
    <div className="relative flex min-h-64 flex-col items-center justify-end gap-3 px-4 pt-10 pb-6 sm:min-h-80">
      {contender.bannerUrl ? (
        <SiteImage
          src={contender.bannerUrl}
          alt=""
          rounded="rounded-none"
          sizes="50vw"
          className="absolute inset-0"
        />
      ) : (
        <span
          aria-hidden="true"
          className={cn("absolute inset-0", styles.wash)}
        />
      )}

      {/* Fades the bottom of the banner into the card, so the name stays readable on any
          photo. */}
      <span
        aria-hidden="true"
        className="from-card via-card/40 absolute inset-0 bg-gradient-to-t to-transparent"
      />

      <span className="relative">
        <MemberAvatar
          fullName={contender.displayName}
          avatarUrl={contender.avatarUrl}
          className={cn(
            "size-20 text-xl ring-4 sm:size-28 sm:text-2xl",
            styles.ring,
          )}
        />
        {hitCount > 0 && (
          // Keyed by the count so every vote mounts a fresh ring and the burst replays.
          <span
            key={hitCount}
            aria-hidden="true"
            className={cn(
              "compet-ring-burst pointer-events-none absolute inset-0 rounded-full opacity-0 ring-4",
              styles.ring,
            )}
          />
        )}
      </span>

      <p
        className={cn(
          "font-heading relative text-center text-lg font-extrabold sm:text-2xl",
          styles.text,
        )}
      >
        {contender.displayName}
      </p>
    </div>
  )
}

function Pillar({
  side,
  share,
  voteCount,
  hitCount,
}: {
  side: CompetSide
  share: number
  voteCount: number
  hitCount: number
}) {
  const translateCompet = useTranslations("Compet")
  const styles = SIDE_STYLES[side]

  return (
    <div className="flex w-20 flex-col items-center gap-2 sm:w-24">
      <p
        className={cn(
          "font-heading text-2xl font-extrabold tabular-nums",
          styles.text,
        )}
      >
        {share}%
      </p>

      <div className="bg-muted relative flex h-56 w-full items-end rounded-xl">
        {/* Never remounted, so a new share animates from the old height. Only the flash
            on top is keyed, to replay with each vote. */}
        <div
          className={cn(
            "compet-pillar relative w-full rounded-xl",
            styles.fill,
          )}
          style={{ ["--compet-share" as string]: `${share}%` }}
        >
          {hitCount > 0 && (
            <span
              key={hitCount}
              aria-hidden="true"
              className="compet-pillar-flash bg-background absolute inset-0 rounded-xl opacity-0"
            />
          )}
        </div>

        {hitCount > 0 && (
          <span
            key={`plus-${hitCount}`}
            aria-hidden="true"
            className={cn(
              "compet-plus-one font-heading pointer-events-none absolute left-1/2 text-2xl font-extrabold opacity-0",
              styles.text,
            )}
            style={{ bottom: `${share}%` }}
          >
            +1
          </span>
        )}
      </div>

      <p className="text-muted-foreground text-xs tabular-nums">
        {translateCompet("voteCount", { count: voteCount })}
      </p>
    </div>
  )
}

function ReasonColumn({
  side,
  contender,
  votes,
  landingVoteIds,
}: {
  side: CompetSide
  contender: CompetContender
  votes: CompetVote[]
  landingVoteIds: Set<string>
}) {
  const translateCompet = useTranslations("Compet")
  const styles = SIDE_STYLES[side]

  return (
    <section
      aria-label={translateCompet("reasonsFor", {
        name: contender.displayName,
      })}
      className="max-h-[32rem] min-w-0 overflow-x-hidden overflow-y-auto p-1"
    >
      <StackedList>
        {votes.map((vote) => (
          <StackedListItem
            key={vote.id}
            className={cn(
              "bg-card rounded-xl border p-3 shadow-xs",
              styles.border,
              landingVoteIds.has(vote.id) && `compet-land-${side}`,
            )}
          >
            <p className="text-sm break-words">{vote.reason}</p>
            <p className="text-muted-foreground mt-2 flex items-center gap-1.5 text-xs">
              <MemberAvatar
                fullName={vote.voter.displayName}
                avatarUrl={vote.voter.avatarUrl}
                className="size-5 text-[0.5rem]"
              />
              {vote.voter.displayName}
            </p>
          </StackedListItem>
        ))}
      </StackedList>
    </section>
  )
}
