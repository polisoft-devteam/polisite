// One tab per duel along the top of /compet, running ones first.
//
// Plain links to ?duel=<id>, so a tab can be copied into Discord and opens on that duel.
// Hidden when there is only one: one duel is not a choice.

import { getTranslations } from "next-intl/server"

import { MemberAvatar } from "@/components/MemberAvatar"
import { NavigationSpinner } from "@/components/NavigationSpinner"
import { Badge } from "@/components/ui/badge"
import type { CurrentCompetition } from "@/features/compet/queries"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

export async function CompetTabs({
  competitions,
  selectedCompetitionId,
}: {
  competitions: CurrentCompetition[]
  selectedCompetitionId: string
}) {
  if (competitions.length < 2) return null

  const translateCompet = await getTranslations("Compet")

  return (
    <nav
      aria-label={translateCompet("tabsLabel")}
      className="border-border -mx-4 flex gap-1 overflow-x-auto border-b px-4 pb-px"
    >
      {competitions.map((competition) => {
        const isSelected = competition.id === selectedCompetitionId

        return (
          <Link
            key={competition.id}
            href={`/compet?duel=${competition.id}`}
            aria-current={isSelected ? "page" : undefined}
            className={cn(
              "-mb-px flex max-w-64 shrink-0 items-center gap-2 border-b-2 px-3 py-2 text-sm transition-colors",
              isSelected
                ? "border-primary-ink text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground border-transparent",
              !competition.isOpen && !isSelected && "opacity-70",
            )}
          >
            <span className="flex shrink-0 -space-x-2">
              <MemberAvatar
                fullName={competition.left.displayName}
                avatarUrl={competition.left.avatarUrl}
                className="ring-compet-left size-6 text-[0.55rem] ring-2"
              />
              <MemberAvatar
                fullName={competition.right.displayName}
                avatarUrl={competition.right.avatarUrl}
                className="ring-compet-right size-6 text-[0.55rem] ring-2"
              />
            </span>

            <span className="truncate">{competition.question}</span>

            {!competition.isOpen && (
              <Badge variant="secondary">{translateCompet("endedTab")}</Badge>
            )}

            <NavigationSpinner className="size-3.5 shrink-0" />
          </Link>
        )
      })}
    </nav>
  )
}
