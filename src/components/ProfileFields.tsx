// The editable half of a profile.
//
// Shared by settings, where a member edits their own, and the admin page, where an admin
// edits anyone's. One component so the two can never drift into offering different fields,
// which is how an admin ends up unable to fix the thing a member got wrong.
//
// The office and the badges are not here: those are awarded, not edited, and live on the
// admin page next to the member they belong to.

import { getTranslations } from "next-intl/server"

import { FormField, FormSelect } from "@/components/FormField"
import { MemberAvatar } from "@/components/MemberAvatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Member, MemberBadge } from "@/db/schema"

export async function ProfileFields({
  member,
  badges,
}: {
  member: Member
  /** The badges this member holds; only these can be the one on show. */
  badges: MemberBadge[]
}) {
  const translateProfile = await getTranslations("Profile")
  const translateBadges = await getTranslations("Badges")

  return (
    <>
      <div className="flex items-center gap-4">
        <MemberAvatar
          fullName={member.fullName}
          avatarUrl={member.avatarUrl}
          className="size-24 text-2xl"
        />

        <FormField
          label={translateProfile("avatar")}
          htmlFor="avatar"
          hint={translateProfile("avatarHint")}
        >
          <Input
            id="avatar"
            name="avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="cursor-pointer"
          />
        </FormField>
      </div>

      <FormField label={translateProfile("fullName")} htmlFor="fullName">
        <Input
          id="fullName"
          name="fullName"
          defaultValue={member.fullName}
          required
          maxLength={120}
        />
      </FormField>

      <FormField label={translateProfile("nickname")} htmlFor="nickname">
        <Input
          id="nickname"
          name="nickname"
          defaultValue={member.nickname ?? ""}
          maxLength={60}
        />
      </FormField>

      {/* A date input, so the value posted is always yyyy-mm-dd whatever the reader's
          locale shows them. The column is a date rather than a timestamp for the same
          reason: a birthday must not shift a day across timezones. */}
      <FormField
        label={translateProfile("birthday")}
        htmlFor="birthday"
        hint={translateProfile("birthdayHint")}
      >
        <Input
          id="birthday"
          name="birthday"
          type="date"
          defaultValue={member.birthday ?? ""}
        />
      </FormField>

      {/* Only offered when there is something to choose between, and it lists only what
          they have been awarded: the action checks the same thing again. */}
      {badges.length > 0 && (
        <FormField
          label={translateProfile("displayedBadge")}
          htmlFor="displayedBadge"
          hint={translateProfile("displayedBadgeHint")}
        >
          <FormSelect
            id="displayedBadge"
            name="displayedBadge"
            defaultValue={member.displayedBadge ?? ""}
          >
            <option value="">{translateProfile("displayedBadgeNone")}</option>
            {badges.map((badge) => (
              <option key={badge.badge} value={badge.badge}>
                {translateBadges(`${badge.badge}.title`)}
              </option>
            ))}
          </FormSelect>
        </FormField>
      )}

      <FormField label={translateProfile("bio")} htmlFor="bio">
        <Textarea
          id="bio"
          name="bio"
          defaultValue={member.bio ?? ""}
          rows={4}
          maxLength={2000}
        />
      </FormField>

      <FormField
        label={translateProfile("githubUrl")}
        htmlFor="githubUrl"
        hint={translateProfile("githubUrlHint")}
      >
        <Input
          id="githubUrl"
          name="githubUrl"
          type="url"
          placeholder="https://github.com/"
          defaultValue={member.githubUrl ?? ""}
          maxLength={300}
        />
      </FormField>
    </>
  )
}
