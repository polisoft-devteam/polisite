"use server"

import type { FormFeedback } from "@/lib/form-feedback"

/** The wizard on /design has to submit somewhere. This deliberately does nothing. */
export async function designNoOpAction(): Promise<FormFeedback> {
  return null
}
