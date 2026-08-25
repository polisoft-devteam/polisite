// A diagonal band across a card's top-left corner, marking an event as not yet settled.
//
// Rotated and oversized so it bleeds off both edges — a ribbon that stops short of the
// corner reads as a mistake. The card must clip its overflow.

import { getTranslations } from "next-intl/server"

export async function SuggestionRibbon() {
  const translateEvents = await getTranslations("Events")

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -top-1 -left-14 z-10 w-40 -rotate-45"
    >
      <span className="bg-accent text-accent-foreground block py-1 text-center text-xs font-semibold tracking-wider uppercase shadow-sm">
        {translateEvents("suggestionRibbon")}
      </span>
    </div>
  )
}
