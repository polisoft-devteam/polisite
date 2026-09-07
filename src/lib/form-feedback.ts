// What a server action hands back when Zod refuses the form.
//
// Actions used to return nothing at all in that case, which left the browser with a reset
// form, no event and no reason why. Anything with a wizard behind it says which fields it
// would not take.

/** Keyed by field name, as Zod flattens it. Null means the submission went through. */
export type FormFeedback = {
  fieldErrors: Record<string, string[] | undefined>
} | null
