import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

// Derived rather than hardcoded so a new Supabase project needs no code change.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined

const nextConfig: NextConfig = {
  images: {
    // Only these hosts may be optimized; anything else is refused rather than proxied.
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      ...(supabaseHostname
        ? [{ protocol: "https" as const, hostname: supabaseHostname }]
        : []),
    ],
  },
}

const withNextIntl = createNextIntlPlugin()

export default withNextIntl(nextConfig)
