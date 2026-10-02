"use server"

import type { EventFormInput } from "@/features/events/schemas"
import type { FormFeedback } from "@/lib/form-feedback"
import type { CompetFormResult } from "@/features/compet/actions"

/** The wizard on /design has to submit somewhere. This deliberately does nothing. */
export async function designNoOpAction(): Promise<
  FormFeedback<EventFormInput>
> {
  return null
}

/** The same for the duel's vote form. */
export async function designCompetNoOpAction(): Promise<CompetFormResult> {
  return null
}
