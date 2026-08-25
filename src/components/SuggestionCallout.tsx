// Explains, on the event's own page, that a suggestion isn't settled yet — and what to do
// about it.

import { getTranslations } from "next-intl/server"

export async function SuggestionCallout() {
  const translateEvents = await getTranslations("Events")

  return (
    <div className="border-accent/40 bg-accent/10 mt-6 rounded-lg border p-4">
      <p className="font-heading font-semibold">
        {translateEvents("suggestionCalloutTitle")}
      </p>
      <p className="text-muted-foreground mt-1 text-sm">
        {translateEvents("suggestionCalloutBody")}
      </p>
    </div>
  )
}
