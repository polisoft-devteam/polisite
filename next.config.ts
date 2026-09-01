import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

// Derived rather than hardcoded so a new Supabase project needs no code change.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined

const nextConfig: NextConfig = {
  // Files under public/ are served by the CDN and otherwise left out of the server
  // bundle, so any page that reads the folder rather than a hardcoded path finds it empty
  // in production. The front page's hero does that. Kept wide, covering every route and
  // the whole site image folder, so moving or adding photos never needs an edit here.
  outputFileTracingIncludes: {
    "/**": ["./public/images/**"],
  },

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
