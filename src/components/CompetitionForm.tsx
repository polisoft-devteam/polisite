// An admin's form for starting a duel: a question, two members, and a banner for each.
//
// The new duel replaces the current one on /compet. The old one is kept, not deleted.

"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"

import { FormField, FormSelect } from "@/components/FormField"
import { ImageDropZone } from "@/components/ImageDropZone"
import { SubmitButton } from "@/components/SubmitButton"
import { Input } from "@/components/ui/input"
import type { CompetFormResult } from "@/features/compet/actions"
import { SportIcon } from "@/lib/icons"

export type CompetitionMemberOption = { id: string; displayName: string }

export function CompetitionForm({
  members,
  createAction,
}: {
  members: CompetitionMemberOption[]
  createAction: (
    previous: CompetFormResult,
    formData: FormData,
  ) => Promise<CompetFormResult>
}) {
  const translateCompet = useTranslations("Compet")
  const [result, formAction] = useActionState(createAction, null)

  const isInvalid = result?.outcome === "invalid"

  return (
    // Remounted after each duel is started, so the image previews clear with the fields.
    <form
      key={result?.outcome === "done" ? result.at : "form"}
      action={formAction}
      className="space-y-4"
    >
      <FormField
        label={translateCompet("questionLabel")}
        htmlFor="compet-question"
      >
        <Input
          id="compet-question"
          name="question"
          maxLength={140}
          placeholder={translateCompet("questionPlaceholder")}
          aria-invalid={isInvalid || undefined}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        {(["left", "right"] as const).map((side) => (
          <div key={side} className="space-y-4">
            <FormField
              label={translateCompet(
                side === "left" ? "leftLabel" : "rightLabel",
              )}
              htmlFor={`compet-${side}-member`}
            >
              <FormSelect
                id={`compet-${side}-member`}
                name={`${side}MemberId`}
                defaultValue=""
                aria-invalid={isInvalid || undefined}
              >
                <option value="" disabled>
                  {translateCompet("chooseMember")}
                </option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.displayName}
                  </option>
                ))}
              </FormSelect>
            </FormField>

            <ImageDropZone
              id={`compet-${side}-banner`}
              name={`${side}Banner`}
              label={translateCompet("bannerLabel")}
              hint={translateCompet("bannerHint")}
            />
          </div>
        ))}
      </div>

      {isInvalid && (
        <p aria-live="polite" className="text-destructive text-sm">
          {translateCompet("createInvalid")}
        </p>
      )}

      <SubmitButton icon={<SportIcon className="size-4" />}>
        {translateCompet("createSubmit")}
      </SubmitButton>
    </form>
  )
}
