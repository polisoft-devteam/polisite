// The date poll: a bar per candidate date, side by side, growing with the votes, and a
// round button under each one to add or remove yours.
//
// The percentage is of everyone who voted in this poll, not of the whole association — you
// can vote for several dates, so the numbers would otherwise never add up to anything
// meaningful.
//
// It disappears entirely once a date is picked: the poll exists to reach that decision,
// and once it is made the answer is the date at the top of the page.
//
// Voting closes once every option is in the past. Derived from the dates rather than
// stored, so there's no job to run and no stale flag.

import { getFormatter, getTranslations } from "next-intl/server"

import { MemberAvatar } from "@/components/MemberAvatar"
import { PageSection } from "@/components/PageSection"
import { Button } from "@/components/ui/button"
import {
  chooseEventDateAction,
  toggleDateVoteAction,
} from "@/features/events/actions"
import type { DateOptionWithVotes } from "@/features/events/queries"
import { CheckIcon, PlusIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"

export async function EventDatePoll({
  eventId,
  timeZone,
  options,
  chosenStartsAt,
  canVote,
  canChooseDate,
  locale,
}: {
  eventId: string
  timeZone: string
  options: DateOptionWithVotes[]
  /** The event's actual date. Once there is one, the poll has done its job. */
  chosenStartsAt: Date | null
  canVote: boolean
  canChooseDate: boolean
  locale: string
}) {
  const translateEvents = await getTranslations("Events")
  const format = await getFormatter({ locale })

  if (options.length === 0 || chosenStartsAt !== null) return null

  const now = new Date()
  const isClosed = options.every((option) => option.startsAt < now)

  // Distinct people, since one member can vote for several dates.
  const totalVoters = new Set(
    options.flatMap((option) => option.voters.map((voter) => voter.memberId)),
  ).size

  const mostVotes = Math.max(...options.map((option) => option.voters.length))

  return (
    <PageSection heading={translateEvents("datePollTitle")}>
      <p className="text-muted-foreground text-sm">
        {isClosed
          ? translateEvents("datePollClosed")
          : translateEvents("datePollHint")}
      </p>

      {/* Side by side and scrollable, so a poll with eight dates is still one glance
          rather than eight rows of scrolling. */}
      <ul className="flex gap-3 overflow-x-auto pb-2">
        {options.map((option) => {
          const voteCount = option.voters.length
          const isPast = option.startsAt < now
          const isLeading = voteCount > 0 && voteCount === mostVotes
          const share = totalVoters === 0 ? 0 : voteCount / totalVoters

          return (
            <li
              key={option.id}
              className={cn(
                "flex w-24 shrink-0 flex-col items-center gap-2",
                isPast && "opacity-50",
              )}
            >
              <span className="text-xs font-semibold tabular-nums">
                {voteCount}
              </span>

              {/* The bar fills from the bottom, so voting visibly raises it. */}
              <div
                aria-hidden="true"
                className="bg-muted relative h-24 w-8 overflow-hidden rounded-full"
              >
                <div
                  className={cn(
                    "absolute inset-x-0 bottom-0 transition-[height] duration-500 ease-out motion-reduce:transition-none",
                    isLeading ? "bg-primary" : "bg-primary/40",
                  )}
                  style={{ height: `${Math.round(share * 100)}%` }}
                />
              </div>

              <time
                dateTime={option.startsAt.toISOString()}
                className="text-center text-[11px] leading-tight"
              >
                {format.dateTime(option.startsAt, {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone,
                })}
              </time>

              {canVote && !isPast && (
                <form action={toggleDateVoteAction}>
                  <input type="hidden" name="dateOptionId" value={option.id} />
                  <Button
                    type="submit"
                    size="icon"
                    variant={option.votedByViewer ? "success" : "outline"}
                    className="size-9 rounded-full"
                    aria-label={
                      option.votedByViewer
                        ? translateEvents("datePollVoted")
                        : translateEvents("datePollVote")
                    }
                  >
                    {option.votedByViewer ? (
                      <CheckIcon className="size-4" />
                    ) : (
                      <PlusIcon className="size-4" />
                    )}
                  </Button>
                </form>
              )}

              {option.voters.length > 0 && (
                <div className="flex justify-center">
                  {option.voters.slice(0, 4).map((voter) => (
                    <MemberAvatar
                      key={voter.memberId}
                      fullName={voter.fullName}
                      avatarUrl={voter.avatarUrl}
                      className="ring-card -ml-2 size-5 text-[9px] ring-2 first:ml-0"
                    />
                  ))}
                </div>
              )}

              {canChooseDate && !isPast && (
                <form action={chooseEventDateAction}>
                  <input type="hidden" name="eventId" value={eventId} />
                  <input type="hidden" name="dateOptionId" value={option.id} />
                  <Button type="submit" size="xs" variant="secondary">
                    {translateEvents("datePollChoose")}
                  </Button>
                </form>
              )}
            </li>
          )
        })}
      </ul>
    </PageSection>
  )
}
