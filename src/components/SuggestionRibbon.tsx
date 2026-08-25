// A diagonal band across a card's top-left corner, marking an event as not yet settled.
//
// Sat too close to the corner before, which clipped the text: a 45° band needs to cross
// the corner far enough down that its full width is over the card. The card clips overflow.

import { getTranslations } from "next-intl/server"

export async function SuggestionRibbon() {
  const translateEvents = await getTranslations("Events")

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-5 -left-12 z-10 w-44 -rotate-45"
    >
      <span
        className="block py-1.5 text-center text-xs font-bold tracking-widest uppercase shadow-md"
        style={{
          background:
            "linear-gradient(90deg, var(--suggestion-from), var(--suggestion-to))",
          color: "var(--suggestion-foreground)",
        }}
      >
        {translateEvents("suggestionRibbon")}
      </span>
    </div>
  )
}
