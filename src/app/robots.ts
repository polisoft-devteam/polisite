// Keep the site out of search engines.
//
// This is a private association site: the public pages still name real people and real
// plans, and nobody here wants to be findable by googling their own name. Being absent
// from an index is trivially reversible; being indexed and cached is not, which is why
// this is the default rather than something to fix later.
//
// It is not a security measure — members-only pages are protected server-side, not by
// asking crawlers nicely.

import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", disallow: "/" }],
  }
}
