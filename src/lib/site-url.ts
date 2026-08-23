// Where this site lives. Used for absolute links in Discord messages and email, which
// can't use a relative path.

/**
 * Resolved in order, so a missing env var in production can't produce localhost links:
 *
 *   1. NEXT_PUBLIC_SITE_URL — the real domain, set explicitly
 *   2. VERCEL_URL — the deployment's own hostname, always present on Vercel
 *   3. localhost, honouring PORT
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured) return configured.replace(/\/$/, "")

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`

  return `http://localhost:${process.env.PORT ?? 3210}`
}
