// What to call someone before they have told us.
//
// Google supplies a name for almost every account, but not all of them: a bare Workspace
// account can arrive with nothing but an address. Falling back to the whole email put
// "someone@gmail.com" in the header and on every event card, so the local part is used
// instead until they set a name themselves.

/** "Victor Persson" from Google, else "victor.persson" from the address. */
export function memberNameFrom(
  googleName: string | null | undefined,
  email: string,
): string {
  const named = googleName?.trim()
  if (named) return named

  const localPart = email.split("@")[0]?.trim()

  // An address with nothing before the @ is not a real address, but the column is NOT
  // NULL, so it needs an answer either way.
  return localPart || email
}
