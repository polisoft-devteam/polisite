// The duel on /compet: two halves, each with its contender's face, pillar and the reasons
// people gave, on that contender's banner. The pillars meet in the middle.
//
// The page re-fetches every few seconds, so other people's votes arrive without a reload.
// A vote this component has not seen on its side before is what sets off the effects: its
// reason flies in from the form, its pillar flashes, and a ring bursts off the contender.
// Moving your vote to the other side counts, so it lands again over there.

"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"

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
import { EditIcon, RemoveIcon } from "@/lib/icons"
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

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh()
    }, REFRESH_MILLISECONDS)

    return () => window.clearInterval(timer)
  }, [router])

  const votesBySide = {
    left: votes.filter((vote) => sideOf(vote) === "left"),
    right: votes.filter((vote) => sideOf(vote) === "right"),
  }
  const shares = competShares(votesBySide.left.length, votesBySide.right.length)

  return (
    <div className="space-y-10">
      <div className="relative grid grid-cols-2 overflow-hidden rounded-2xl border">
        {(["left", "right"] as const).map((side) => (
          <CompetHalf
            key={side}
            side={side}
            contender={competition[side]}
            share={shares[side]}
            votes={votesBySide[side]}
            hitCount={hitCounts[side]}
            landingVoteIds={landingVoteIds}
            editableVoteIds={editableVoteIds}
            removableVoteIds={removableVoteIds}
            onEdit={setEditingVote}
            removeVoteAction={removeVoteAction}
          />
        ))}

        {/* Level with the faces: the corner above each pillar is a fixed height. */}
        <span
          aria-hidden="true"
          className="compet-versus bg-background font-heading absolute top-42 left-1/2 -mt-8 -ml-8 flex size-16 items-center justify-center rounded-full border-2 text-2xl font-extrabold sm:top-52 sm:-mt-10 sm:-ml-10 sm:size-20 sm:text-3xl"
        >
          {translateCompet("versus")}
        </span>
      </div>

      {votes.length === 0 && (
        <p className="text-muted-foreground text-center text-sm">
          {translateCompet("noVotes")}
        </p>
      )}

      {/* Remounted when an edit starts or ends, so the fields start from that vote. */}
      <CompetVoteForm
        key={editingVote?.id ?? "new"}
        competition={competition}
        ownVoteTimes={ownVoteTimes}
        editingVote={editingVote}
        onEditFinished={() => setEditingVote(null)}
        voteAction={voteAction}
      />
    </div>
  )
}

function CompetHalf({
  side,
  contender,
  share,
  votes,
  hitCount,
  landingVoteIds,
  editableVoteIds,
  removableVoteIds,
  onEdit,
  removeVoteAction,
}: {
  side: CompetSide
  contender: CompetContender
  share: number
  votes: CompetVote[]
  hitCount: number
  landingVoteIds: Set<string>
  editableVoteIds: string[]
  removableVoteIds: string[]
  onEdit: (vote: CompetVote) => void
  removeVoteAction: (formData: FormData) => Promise<void>
}) {
  const styles = SIDE_STYLES[side]

  return (
    <div className="relative min-w-0">
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

      {/* Clear at the top so the banner shows, darker below where the reasons sit. */}
      <span
        aria-hidden="true"
        className="from-background/85 via-background/40 absolute inset-0 bg-gradient-to-t to-transparent"
      />

      <div className="relative flex flex-col gap-6 px-3 pb-6 sm:px-6">
        <ContenderCorner
          side={side}
          contender={contender}
          hitCount={hitCount}
        />

        {/* The pillar hugs the middle of the page and the reasons fill the outer edge, so
            the two pillars stand next to each other. On a phone they stack. */}
        <div
          className={cn(
            "flex flex-col gap-4 md:items-start",
            side === "left" ? "md:flex-row-reverse" : "md:flex-row",
          )}
        >
          <div
            className={cn(
              "flex",
              side === "left" ? "justify-end" : "justify-start",
            )}
          >
            <Pillar
              side={side}
              share={share}
              voteCount={votes.length}
              hitCount={hitCount}
            />
          </div>

          <ReasonColumn
            side={side}
            contender={contender}
            votes={votes}
            landingVoteIds={landingVoteIds}
            editableVoteIds={editableVoteIds}
            removableVoteIds={removableVoteIds}
            onEdit={onEdit}
            removeVoteAction={removeVoteAction}
          />
        </div>
      </div>
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
    <div className="flex h-64 flex-col items-center justify-end gap-3 sm:h-80">
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
          "font-heading bg-background/80 max-w-full truncate rounded-full px-4 py-1 text-center text-lg font-extrabold backdrop-blur-sm sm:text-2xl",
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
    <div className="bg-background/70 flex w-20 shrink-0 flex-col items-center gap-2 rounded-2xl p-2 backdrop-blur-sm sm:w-24">
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
      className="max-h-[32rem] min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-1"
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
