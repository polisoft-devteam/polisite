// Says, up in the hero beside the event's name, that a suggestion isn't settled yet — and
// what to do about it.
//
// It sits with the title rather than at the foot of the page because it changes how
// everything below it should be read: these are proposed dates, not arrangements. Someone
// who learns that only after scrolling has already read the page the wrong way.

import { getTranslations } from "next-intl/server"

import { SuggestionIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"

export async function SuggestionCallout({
  onPhoto = false,
}: {
  /** Over the hero photograph, where the ground is dark and the body has to lighten. */
  onPhoto?: boolean
}) {
  const translateEvents = await getTranslations("Events")

  return (
    <div className={cn("flex gap-2", onPhoto ? "mt-3 drop-shadow" : "mt-4")}>
      <SuggestionIcon className="text-notification mt-0.5 size-4 shrink-0" />

      <div>
        <p className="text-notification font-heading text-sm font-semibold">
          {translateEvents("suggestionCalloutTitle")}
        </p>
        <p
          className={cn(
            "mt-0.5 max-w-prose text-sm",
            onPhoto ? "text-white/85" : "text-muted-foreground",
          )}
        >
          {translateEvents("suggestionCalloutBody")}
        </p>
      </div>
    </div>
  )
}
