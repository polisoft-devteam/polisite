// What a server action hands back when Zod refuses the form.
//
// Actions used to return nothing at all in that case, which left the browser with a reset
// form, no event and no reason why. Anything with a wizard behind it says which fields it
// would not take, and hands back what was typed so the form can be given straight back
// with the answers still in it.

export type FormFeedback<TValues = unknown> = {
  /** Keyed by field name, as Zod flattens it. */
  fieldErrors: Record<string, string[] | undefined>
  /**
   * Exactly what was submitted, in the shape the form reads.
   *
   * React empties an uncontrolled form once its action returns, whatever the answer was.
   * Feeding these back in as the fields' defaults is what makes the reset land on what the
   * member typed rather than on an empty form.
   */
  values: TValues
} | null
