// Standard page width and padding, so every page lines up with the header and footer.
// Also the slide animation on navigation — it lives here rather than in a layout because
// layouts persist across navigations, so their enter and exit never fire.

import { ViewTransition } from "react"

import { cn } from "@/lib/utils"

// Links choose their own direction with transitionTypes; untyped navigations (browser
// back, refresh) get no slide, which is what "none" is for.
const directionalSlide = {
  "nav-forward": "nav-forward",
  "nav-back": "nav-back",
  default: "none",
}

export function PageContainer({
  children,
  belowHero = false,
}: {
  children: React.ReactNode
  /**
   * Trims the padding above, for a page whose hero already ends in a wave. The full
   * padding is there to separate content from the header, and a hero does that itself.
   */
  belowHero?: boolean
}) {
  return (
    <ViewTransition
      enter={directionalSlide}
      exit={directionalSlide}
      default="none"
    >
      <div
        className={cn(
          "mx-auto w-full max-w-6xl px-4 pb-12 2xl:max-w-7xl",
          belowHero ? "pt-4" : "pt-12",
        )}
      >
        {children}
      </div>
    </ViewTransition>
  )
}
