// Pick a side, say why, vote. Three votes in any five minutes, with a countdown once
// they're spent.
//
// The limit shown here is a convenience; the action counts again from the database.

"use client"

import { useActionState, useEffect, useState } from "react"
import { useTranslations } from "next-intl"

import { Confetti } from "@/components/Confetti"
import { FormField } from "@/components/FormField"
import { MemberAvatar } from "@/components/MemberAvatar"
import { SubmitButton } from "@/components/SubmitButton"
import { Input } from "@/components/ui/input"
import type { CompetFormResult } from "@/features/compet/actions"
import type {
  CompetContender,
  CurrentCompetition,
} from "@/features/compet/queries"
import { competVoteAllowance } from "@/lib/compet"
import { SportIcon } from "@/lib/icons"
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
  voteAction,
}: {
  competition: CurrentCompetition
  ownVoteTimes: Date[]
  voteAction: (
    previous: CompetFormResult,
    formData: FormData,
  ) => Promise<CompetFormResult>
}) {
  const translateCompet = useTranslations("Compet")
  const [result, formAction] = useActionState(voteAction, null)

  const [pickedMemberId, setPickedMemberId] = useState<string | null>(null)
  const [reason, setReason] = useState("")
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

  useEffect(() => {
    const tick = () => setNow(Date.now())

    const timer = window.setInterval(tick, 1000)
    tick()

    return () => window.clearInterval(timer)
  }, [])

  const allowance =
    now === null ? null : competVoteAllowance(ownVoteTimes, new Date(now))
  const canSubmit =
    allowance !== null &&
    allowance.votesLeft > 0 &&
    pickedMemberId !== null &&
    reason.trim() !== ""

  const errorMessage =
    result?.outcome === "rateLimited"
      ? translateCompet("rateLimited")
      : result?.outcome === "invalid"
        ? translateCompet("invalid")
        : null

  return (
    <form
      action={formAction}
      className="bg-card mx-auto max-w-md space-y-4 rounded-2xl border p-5 shadow-sm"
    >
      <input type="hidden" name="competitionId" value={competition.id} />

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
        icon={<SportIcon className="size-4" />}
      >
        {translateCompet("submit")}
      </SubmitButton>

      <p
        aria-live="polite"
        className={cn(
          "text-center text-xs tabular-nums",
          errorMessage ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {errorMessage ??
          (allowance?.nextVoteAt
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
