// Pick a side, say why, vote. Three votes in any five minutes, with a countdown once
// they're spent. The same form changes a vote you already cast, which costs nothing.
//
// The limit shown here is a convenience; the action counts again from the database.

"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"

import { Confetti } from "@/components/Confetti"
import { FormField } from "@/components/FormField"
import { MemberAvatar } from "@/components/MemberAvatar"
import { SubmitButton } from "@/components/SubmitButton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { CompetFormResult } from "@/features/compet/actions"
import type {
  CompetContender,
  CompetVote,
  CurrentCompetition,
} from "@/features/compet/queries"
import { competVoteAllowance } from "@/lib/compet"
import { SaveIcon, SportIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"

/** "4:07" */
function formatMinutesAndSeconds(milliseconds: number): string {
  const totalSeconds = Math.max(Math.ceil(milliseconds / 1000), 0)
  const seconds = String(totalSeconds % 60).padStart(2, "0")

  return `${Math.floor(totalSeconds / 60)}:${seconds}`
}

export function CompetVoteForm({
  competition,
  ownVoteTimes,
  editingVote,
  onEditFinished,
  voteAction,
}: {
  competition: CurrentCompetition
  ownVoteTimes: Date[]
  /** The viewer's own vote being changed, or null when casting a new one. */
  editingVote: CompetVote | null
  onEditFinished: () => void
  voteAction: (
    previous: CompetFormResult,
    formData: FormData,
  ) => Promise<CompetFormResult>
}) {
  const translateCompet = useTranslations("Compet")
  const formRef = useRef<HTMLFormElement>(null)

  const [result, formAction] = useActionState(
    async (previous: CompetFormResult, formData: FormData) => {
      const answer = await voteAction(previous, formData)
      if (editingVote && answer?.outcome === "done") onEditFinished()
      return answer
    },
    null,
  )

  const [pickedMemberId, setPickedMemberId] = useState<string | null>(
    editingVote?.votedForMemberId ?? null,
  )
  const [reason, setReason] = useState(editingVote?.reason ?? "")
  // Null until the first tick after mount, as in NextSpinCountdown: the server's clock and
  // the reader's would render different countdowns and fail hydration.
  const [now, setNow] = useState<number | null>(null)
  const [handledResultAt, setHandledResultAt] = useState<number | null>(null)
  const [confettiSeed, setConfettiSeed] = useState<number | null>(null)

  // A vote that went through clears the reason and throws the confetti, once per answer.
  if (result && result.at !== handledResultAt) {
    setHandledResultAt(result.at)

    if (result.outcome === "done") {
      setReason("")
      setConfettiSeed(result.at)
    }
  }

  // Edit is pressed on a reason far up the page, so bring the form to the reader.
  useEffect(() => {
    if (!editingVote) return

    // Focus before scrolling: focusing during a smooth scroll cancels it in Chrome.
    formRef.current?.querySelector<HTMLInputElement>("#compet-reason")?.focus({
      preventScroll: true,
    })
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [editingVote])

  useEffect(() => {
    const tick = () => setNow(Date.now())

    const timer = window.setInterval(tick, 1000)
    tick()

    return () => window.clearInterval(timer)
  }, [])

  const allowance =
    now === null ? null : competVoteAllowance(ownVoteTimes, new Date(now))
  const hasVoteToGive =
    editingVote !== null || (allowance !== null && allowance.votesLeft > 0)
  const canSubmit =
    hasVoteToGive && pickedMemberId !== null && reason.trim() !== ""

  const errorMessage =
    result?.outcome === "rateLimited"
      ? translateCompet("rateLimited")
      : result?.outcome === "invalid"
        ? translateCompet("invalid")
        : null

  return (
    <form
      ref={formRef}
      action={formAction}
      className={cn(
        "bg-card mx-auto max-w-md space-y-4 rounded-2xl border p-5 shadow-sm",
        editingVote && "ring-ring/50 ring-3",
      )}
    >
      <input type="hidden" name="competitionId" value={competition.id} />
      {editingVote && (
        <input type="hidden" name="voteId" value={editingVote.id} />
      )}

      <fieldset>
        <legend className="mb-2 text-sm font-medium">
          {translateCompet("pickLabel")}
        </legend>

        <div className="grid grid-cols-2 gap-3">
          <ContenderChoice
            side="left"
            contender={competition.left}
            isPicked={pickedMemberId === competition.left.memberId}
            onPick={setPickedMemberId}
          />
          <ContenderChoice
            side="right"
            contender={competition.right}
            isPicked={pickedMemberId === competition.right.memberId}
            onPick={setPickedMemberId}
          />
        </div>
      </fieldset>

      <FormField label={translateCompet("reasonLabel")} htmlFor="compet-reason">
        <Input
          id="compet-reason"
          name="reason"
          maxLength={200}
          autoComplete="off"
          placeholder={translateCompet("reasonPlaceholder")}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          aria-invalid={result?.outcome === "invalid" || undefined}
        />
      </FormField>

      <SubmitButton
        className="w-full"
        size="lg"
        disabled={!canSubmit}
        icon={
          editingVote ? (
            <SaveIcon className="size-4" />
          ) : (
            <SportIcon className="size-4" />
          )
        }
      >
        {translateCompet(editingVote ? "saveEdit" : "submit")}
      </SubmitButton>

      {editingVote && (
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={onEditFinished}
        >
          {translateCompet("cancelEdit")}
        </Button>
      )}

      <p
        aria-live="polite"
        className={cn(
          "text-center text-xs tabular-nums",
          errorMessage ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {errorMessage ??
          (editingVote
            ? translateCompet("editingHint")
            : allowance?.nextVoteAt
              ? translateCompet("nextVoteIn", {
                  time: formatMinutesAndSeconds(
                    allowance.nextVoteAt.getTime() - now!,
                  ),
                })
              : allowance &&
                translateCompet("votesLeft", { count: allowance.votesLeft }))}
      </p>

      {confettiSeed !== null && (
        <Confetti
          key={confettiSeed}
          seed={confettiSeed}
          onDone={() => setConfettiSeed(null)}
        />
      )}
    </form>
  )
}

function ContenderChoice({
  side,
  contender,
  isPicked,
  onPick,
}: {
  side: "left" | "right"
  contender: CompetContender
  isPicked: boolean
  onPick: (memberId: string) => void
}) {
  return (
    <label
      className={cn(
        "has-focus-visible:ring-ring/50 flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-3 text-center text-sm font-medium transition-colors has-focus-visible:ring-3",
        isPicked
          ? side === "left"
            ? "border-compet-left bg-compet-left/15"
            : "border-compet-right bg-compet-right/15"
          : "border-border hover:bg-muted/50",
      )}
    >
      <input
        type="radio"
        name="votedForMemberId"
        value={contender.memberId}
        checked={isPicked}
        onChange={() => onPick(contender.memberId)}
        className="sr-only"
      />
      <MemberAvatar
        fullName={contender.displayName}
        avatarUrl={contender.avatarUrl}
        className="size-12"
      />
      <span className="min-w-0 break-words">{contender.displayName}</span>
    </label>
  )
}
