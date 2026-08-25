// The date poll: one bar per candidate date, filled in proportion to how many can make it,
// with the faces of who voted for what.
//
// The percentage is of everyone who voted in this poll, not of the whole association — you
// can vote for several dates, so the numbers would otherwise never add up to anything
// meaningful.
//
// Voting closes once every option is in the past. Derived from the dates rather than
// stored, so there's no job to run and no stale flag.

import { getFormatter, getTranslations } from "next-intl/server"

import { StackedList, StackedListItem } from "@/components/ItemList"
import { MemberAvatar } from "@/components/MemberAvatar"
import { PageSection } from "@/components/PageSection"
import { Button } from "@/components/ui/button"
import {
  chooseEventDateAction,
  toggleDateVoteAction,
} from "@/features/events/actions"
import type { DateOptionWithVotes } from "@/features/events/queries"
import { CheckIcon } from "@/lib/icons"
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
  /** The event's actual date, so the winning option can be marked. */
  chosenStartsAt: Date | null
  canVote: boolean
  canChooseDate: boolean
  locale: string
}) {
  const translateEvents = await getTranslations("Events")
  const format = await getFormatter({ locale })

  if (options.length === 0) return null

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

      <StackedList>
        {options.map((option) => {
          const voteCount = option.voters.length
          const isChosen =
            chosenStartsAt !== null &&
            option.startsAt.getTime() === chosenStartsAt.getTime()
          const isPast = option.startsAt < now
          const isLeading = voteCount > 0 && voteCount === mostVotes

          const share = totalVoters === 0 ? 0 : voteCount / totalVoters

          return (
            <StackedListItem
              key={option.id}
              className={cn(
                "border-border bg-card relative overflow-hidden rounded-lg border p-4",
                isPast && "opacity-60",
                isChosen && "border-primary",
              )}
            >
              {/* The bar is the background of the row, so the text sits on top of it. */}
              <div
                aria-hidden="true"
                className={cn(
                  "absolute inset-y-0 left-0 transition-[width]",
                  isLeading ? "bg-primary/15" : "bg-muted",
                )}
                style={{ width: `${Math.round(share * 100)}%` }}
              />

              <div className="relative flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium">
                    {isChosen && (
                      <CheckIcon className="text-primary size-4 shrink-0" />
                    )}
                    <time dateTime={option.startsAt.toISOString()}>
                      {format.dateTime(option.startsAt, {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone,
                      })}
                    </time>
                  </p>

                  <p className="text-muted-foreground mt-0.5 text-sm">
                    <span className="tabular-nums">
                      {Math.round(share * 100)}%
                    </span>
                    {" · "}
                    {translateEvents("datePollVotes", { count: voteCount })}
                    {isLeading && !isChosen && (
                      <> · {translateEvents("datePollLeading")}</>
                    )}
                  </p>

                  {option.voters.length > 0 && (
                    <div className="mt-2 flex">
                      {option.voters.map((voter) => (
                        <MemberAvatar
                          key={voter.memberId}
                          fullName={voter.fullName}
                          avatarUrl={voter.avatarUrl}
                          className="ring-card -ml-2 size-6 text-[10px] ring-2 first:ml-0"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 gap-2">
                  {canVote && !isPast && (
                    <form action={toggleDateVoteAction}>
                      <input
                        type="hidden"
                        name="dateOptionId"
                        value={option.id}
                      />
                      <Button
                        type="submit"
                        size="sm"
                        variant={option.votedByViewer ? "default" : "outline"}
                      >
                        {option.votedByViewer
                          ? translateEvents("datePollVoted")
                          : translateEvents("datePollVote")}
                      </Button>
                    </form>
                  )}

                  {canChooseDate && !isChosen && !isPast && (
                    <form action={chooseEventDateAction}>
                      <input type="hidden" name="eventId" value={eventId} />
                      <input
                        type="hidden"
                        name="dateOptionId"
                        value={option.id}
                      />
                      <Button type="submit" size="sm" variant="secondary">
                        {translateEvents("datePollChoose")}
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </StackedListItem>
          )
        })}
      </StackedList>
    </PageSection>
  )
}
