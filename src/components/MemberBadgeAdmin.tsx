// Handing out patches and offices, on the admin page.
//
// Plain forms posting to server actions, so this needs no client JavaScript. Each award is
// its own form rather than one big one, because "give Pidde the traveller badge" is a
// single decision and should be a single click.

import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { FormSelect } from "@/components/FormField"
import type { MemberBadge } from "@/db/schema"
import {
  awardBadgeAction,
  removeBadgeAction,
  setMemberTitleAction,
} from "@/features/members/badge-actions"
import { BADGES } from "@/features/members/badges"
import { MEMBER_TITLES } from "@/features/members/titles"
import { CloseIcon, PlusIcon } from "@/lib/icons"

export async function MemberBadgeAdmin({
  memberId,
  officialTitle,
  badges,
}: {
  memberId: string
  officialTitle: string | null
  badges: MemberBadge[]
}) {
  const translateAdmin = await getTranslations("Admin")
  const translateBadges = await getTranslations("Badges")
  const translateProfile = await getTranslations("Profile")
  const translateTitles = await getTranslations("Titles")

  const held = new Set(badges.map((badge) => badge.badge))
  const available = BADGES.filter((badge) => !held.has(badge.key))

  return (
    <div className="mt-3 space-y-3 border-t pt-3">
      <form
        action={setMemberTitleAction}
        className="flex flex-wrap items-center gap-2"
      >
        <input type="hidden" name="memberId" value={memberId} />

        <FormSelect
          name="officialTitle"
          defaultValue={officialTitle ?? ""}
          className="w-auto"
          aria-label={translateAdmin("titleLabel")}
        >
          <option value="">{translateProfile("officialTitleNone")}</option>
          {MEMBER_TITLES.map((title) => (
            <option key={title} value={title}>
              {translateTitles(title)}
            </option>
          ))}
        </FormSelect>

        <Button type="submit" variant="outline" size="sm">
          {translateAdmin("setTitle")}
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        {badges.map((badge) => (
          <form key={badge.badge} action={removeBadgeAction}>
            <input type="hidden" name="memberId" value={memberId} />
            <input type="hidden" name="badge" value={badge.badge} />
            <Button
              type="submit"
              variant="secondary"
              size="xs"
              title={translateAdmin("removeBadge")}
            >
              {translateBadges(`${badge.badge}.title`)}
              <CloseIcon className="size-3" />
            </Button>
          </form>
        ))}

        {available.length > 0 && (
          <form action={awardBadgeAction} className="flex items-center gap-2">
            <input type="hidden" name="memberId" value={memberId} />

            <FormSelect
              name="badge"
              className="w-auto"
              aria-label={translateAdmin("awardBadge")}
            >
              {available.map((badge) => (
                <option key={badge.key} value={badge.key}>
                  {translateBadges(`${badge.key}.title`)}
                </option>
              ))}
            </FormSelect>

            <Button type="submit" variant="outline" size="sm">
              <PlusIcon className="size-3" />
              {translateAdmin("awardBadge")}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
