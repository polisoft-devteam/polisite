import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

// Derived rather than hardcoded so a new Supabase project needs no code change.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined

const nextConfig: NextConfig = {
  experimental: {
    // Lets app/global-not-found.tsx answer a URL that matches no route at all. Without
    // it, Next wraps such a page in a default layout of its own, and a page that brings
    // its own <html> — which it must, to carry the stylesheet — collides with it and
    // hydration fails. Documented for exactly this case: a root layout that lives under a
    // dynamic segment, which ours does, at app/[locale].
    globalNotFound: true,

    serverActions: {
      // A photo is posted through a server action, and the default cap is 1 MB, which a
      // phone photo passes before it reaches lib/storage.ts to be resized. Kept a little
      // above the 12 MB that storage refuses outright, so the rejection comes from us
      // with a message rather than from the framework with a stack trace.
      bodySizeLimit: "14mb",
    },
  },

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
