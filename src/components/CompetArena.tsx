// The duel on /compet: two faces with VS between them, the pillars under them, and the
// reasons people gave stacked on the side they voted for. Each contender's banner is the
// background of their half of the whole screen.
//
// The page re-fetches every few seconds, so other people's votes arrive without a reload.
// A vote this component has not seen on its side before is what sets off the effects: its
// reason flies in from the form, its pillar flashes, and a ring bursts off the contender.
// Moving your vote to the other side counts, so it lands again over there.

"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"

import { CompetEndsIn } from "@/components/CompetEndsIn"
import { CompetVoteForm } from "@/components/CompetVoteForm"
import { StackedList, StackedListItem } from "@/components/ItemList"
import { MemberAvatar } from "@/components/MemberAvatar"
import { SiteImage } from "@/components/SiteImage"
import { SubmitButton } from "@/components/SubmitButton"
import { Tooltip } from "@/components/Tooltip"
import { Button } from "@/components/ui/button"
import type { CompetFormResult } from "@/features/compet/actions"
import type {
  CompetContender,
  CompetVote,
  CurrentCompetition,
} from "@/features/compet/queries"
import { useRouter } from "@/i18n/navigation"
import { competShares } from "@/lib/compet"
import { EditIcon, RemoveIcon, SportIcon } from "@/lib/icons"
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

/** A vote is new to a side when this pair has not been seen, so a move counts as arriving. */
function voteSideKey(vote: CompetVote): string {
  return `${vote.id}:${vote.votedForMemberId}`
}

export function CompetArena({
  competition,
  votes,
  ownVoteTimes,
  editableVoteIds,
  removableVoteIds,
  voteAction,
  removeVoteAction,
  paintsPageBackground = true,
}: {
  competition: CurrentCompetition
  /** Newest first. */
  votes: CompetVote[]
  ownVoteTimes: Date[]
  /** Decided on the server by permissions.ts; the buttons only follow. */
  editableVoteIds: string[]
  removableVoteIds: string[]
  voteAction: (
    previous: CompetFormResult,
    formData: FormData,
  ) => Promise<CompetFormResult>
  removeVoteAction: (formData: FormData) => Promise<void>
  /** Off on /design, where a sample would otherwise tint the whole catalogue. */
  paintsPageBackground?: boolean
}) {
  const translateCompet = useTranslations("Compet")
  const router = useRouter()

  // Votes already on the page when it loaded don't fly in; only ones that arrive after.
  const [knownVoteSideKeys, setKnownVoteSideKeys] = useState(
    () => new Set(votes.map(voteSideKey)),
  )
  const [landingVoteIds, setLandingVoteIds] = useState<Set<string>>(new Set())
  const [hitCounts, setHitCounts] = useState({ left: 0, right: 0 })
  const [editingVote, setEditingVote] = useState<CompetVote | null>(null)

  const sideOf = (vote: CompetVote): CompetSide =>
    vote.votedForMemberId === competition.left.memberId ? "left" : "right"

  // Adjusted during render rather than in an effect, so the new reason is already flying
  // on the first paint that contains it instead of flashing in place first.
  const arrivedVotes = votes.filter(
    (vote) => !knownVoteSideKeys.has(voteSideKey(vote)),
  )
  if (arrivedVotes.length > 0) {
    setKnownVoteSideKeys(new Set(votes.map(voteSideKey)))
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

  // Only while it can change: a decided duel has nothing new to fetch.
  useEffect(() => {
    if (!competition.isOpen) return

    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh()
    }, REFRESH_MILLISECONDS)

    return () => window.clearInterval(timer)
  }, [router, competition.isOpen])

  const leftVotes = votes.filter((vote) => sideOf(vote) === "left")
  const rightVotes = votes.filter((vote) => sideOf(vote) === "right")
  const shares = competShares(leftVotes.length, rightVotes.length)

  const reasonColumnProps = {
    landingVoteIds,
    editableVoteIds,
    removableVoteIds,
    onEdit: setEditingVote,
    removeVoteAction,
  }

  return (
    <div className="space-y-10">
      {paintsPageBackground && <CompetBackdrop competition={competition} />}

      <div className="space-y-3">
        <div className="relative grid grid-cols-2 overflow-hidden rounded-2xl border">
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

        <CompetEndsIn endsAt={competition.endsAt} isOpen={competition.isOpen} />
      </div>

      {/* Two columns of reasons with the pillars between them, and on a phone the pillars
          first and the reasons in two columns beneath. */}
      <div className="grid grid-cols-2 items-start gap-4 md:grid-cols-[1fr_auto_1fr] md:gap-8">
        <ReasonColumn
          side="left"
          contender={competition.left}
          votes={leftVotes}
          {...reasonColumnProps}
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
          {...reasonColumnProps}
        />
      </div>

      {votes.length === 0 && competition.isOpen && (
        <p className="text-muted-foreground text-center text-sm">
          {translateCompet("noVotes")}
        </p>
      )}

      {competition.isOpen ? (
        // Remounted when an edit starts or ends, so the fields start from that vote.
        <CompetVoteForm
          key={editingVote?.id ?? "new"}
          competition={competition}
          ownVoteTimes={ownVoteTimes}
          editingVote={editingVote}
          onEditFinished={() => setEditingVote(null)}
          voteAction={voteAction}
        />
      ) : (
        <CompetVerdict
          competition={competition}
          leftVotes={leftVotes.length}
          rightVotes={rightVotes.length}
        />
      )}
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

      {/* On a pill of its own, so the name reads on any photo. */}
      <p
        className={cn(
          "font-heading bg-background/80 relative max-w-full truncate rounded-full px-4 py-1 text-center text-lg font-extrabold backdrop-blur-sm sm:text-2xl",
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
    // A frosted backing so the numbers read on any photo behind them.
    <div className="bg-background/70 flex w-20 flex-col items-center gap-2 rounded-2xl p-2 backdrop-blur-sm sm:w-24">
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
  editableVoteIds,
  removableVoteIds,
  onEdit,
  removeVoteAction,
}: {
  side: CompetSide
  contender: CompetContender
  votes: CompetVote[]
  landingVoteIds: Set<string>
  editableVoteIds: string[]
  removableVoteIds: string[]
  onEdit: (vote: CompetVote) => void
  removeVoteAction: (formData: FormData) => Promise<void>
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

            <div className="mt-2 flex items-center gap-1">
              <p className="text-muted-foreground flex min-w-0 flex-1 items-center gap-1.5 text-xs">
                <MemberAvatar
                  fullName={vote.voter.displayName}
                  avatarUrl={vote.voter.avatarUrl}
                  className="size-5 shrink-0 text-[0.5rem]"
                />
                <span className="truncate">{vote.voter.displayName}</span>
              </p>

              {editableVoteIds.includes(vote.id) && (
                <Tooltip label={translateCompet("editVote")}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={translateCompet("editVote")}
                    onClick={() => onEdit(vote)}
                  >
                    <EditIcon className="size-3.5" />
                  </Button>
                </Tooltip>
              )}

              {removableVoteIds.includes(vote.id) && (
                <form action={removeVoteAction}>
                  <input type="hidden" name="voteId" value={vote.id} />
                  <Tooltip label={translateCompet("removeVote")}>
                    <SubmitButton
                      variant="ghost"
                      size="icon-xs"
                      aria-label={translateCompet("removeVote")}
                      icon={<RemoveIcon className="size-3.5" />}
                    />
                  </Tooltip>
                </form>
              )}
            </div>
          </StackedListItem>
        ))}
      </StackedList>
    </section>
  )
}

/**
 * The two banners behind the whole page, each filling its half of the window and staying
 * put while the page scrolls over it. Kept off the header and footer, which stay plain.
 */
function CompetBackdrop({ competition }: { competition: CurrentCompetition }) {
  return (
    <div
      aria-hidden="true"
      // Starts under the sticky header (its height plus its border), which is see-through
      // and would otherwise show the photos. The footer paints its own background over it.
      className="pointer-events-none fixed inset-x-0 top-[calc(3.5rem+1px)] bottom-0 -z-10 grid grid-cols-2 xl:top-[calc(4rem+1px)]"
    >
      {(["left", "right"] as const).map((side) => {
        const bannerUrl = competition[side].bannerUrl

        return bannerUrl ? (
          <SiteImage
            key={side}
            src={bannerUrl}
            alt=""
            rounded="rounded-none"
            sizes="50vw"
            priority
            className="h-full"
          />
        ) : (
          <span key={side} className={SIDE_STYLES[side].wash} />
        )
      })}

      {/* Dims the photos enough for the reasons and the form to stay readable. */}
      <span className="bg-background/60 absolute inset-0" />
    </div>
  )
}

/** Where the form was, once the duel has ended: who took it. */
function CompetVerdict({
  competition,
  leftVotes,
  rightVotes,
}: {
  competition: CurrentCompetition
  leftVotes: number
  rightVotes: number
}) {
  const translateCompet = useTranslations("Compet")

  const winner =
    leftVotes === rightVotes
      ? null
      : leftVotes > rightVotes
        ? competition.left
        : competition.right

  return (
    <div className="bg-card mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border p-6 text-center shadow-sm">
      <SportIcon className="text-primary-ink size-8" />
      <p className="font-heading text-xl font-extrabold">
        {winner
          ? translateCompet("verdictWinner", { name: winner.displayName })
          : leftVotes === 0
            ? translateCompet("verdictNoVotes")
            : translateCompet("verdictTie")}
      </p>
    </div>
  )
}
