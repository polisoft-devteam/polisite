// The date poll on an event page: each candidate date, how many can make it, and a button
// to add or remove your own vote.
//
// Voting closes once every option is in the past. That's derived from the dates rather
// than stored, so there's no job to run and no stale flag.

import { getFormatter, getTranslations } from "next-intl/server"

import { ItemList } from "@/components/ItemList"
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
  const mostVotes = Math.max(...options.map((option) => option.voteCount))

  return (
    <PageSection heading={translateEvents("datePollTitle")}>
      <p className="text-muted-foreground text-sm">
        {isClosed
          ? translateEvents("datePollClosed")
          : translateEvents("datePollHint")}
      </p>

      <ItemList>
        {options.map((option) => {
          const isChosen =
            chosenStartsAt !== null &&
            option.startsAt.getTime() === chosenStartsAt.getTime()
          const isPast = option.startsAt < now
          const isLeading = option.voteCount === mostVotes && mostVotes > 0

          return (
            <li
              key={option.id}
              className={cn(
                "flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between",
                isPast && "opacity-60",
              )}
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-medium">
                  {isChosen && (
                    <CheckIcon className="text-primary size-4 shrink-0" />
                  )}
                  <time dateTime={option.startsAt.toISOString()}>
                    {format.dateTime(option.startsAt, {
                      dateStyle: "full",
                      timeStyle: "short",
                      timeZone,
                    })}
                  </time>
                </p>
                <p className="text-muted-foreground text-sm">
                  {translateEvents("datePollVotes", {
                    count: option.voteCount,
                  })}
                  {isLeading && !isChosen && (
                    <> · {translateEvents("datePollLeading")}</>
                  )}
                </p>
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
            </li>
          )
        })}
      </ItemList>
    </PageSection>
  )
}
