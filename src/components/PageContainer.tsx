// Standard page width and padding, so every page lines up with the header and footer.
// Also the slide animation on navigation — it lives here rather than in a layout because
// layouts persist across navigations, so their enter and exit never fire.

import { ViewTransition } from "react"

// Links choose their own direction with transitionTypes; untyped navigations (browser
// back, refresh) get no slide, which is what "none" is for.
const directionalSlide = {
  "nav-forward": "nav-forward",
  "nav-back": "nav-back",
  default: "none",
}

export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition
      enter={directionalSlide}
      exit={directionalSlide}
      default="none"
    >
      <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-4 py-12">{children}</div>
    </ViewTransition>
  )
}
