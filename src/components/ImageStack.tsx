// One to three photos, tilted and overlapping, in one of two arrangements.
//
//   pile     a large one with the others dropped on top of it. The timeline's.
//   cascade  each one below and offset from the last, so they read top to bottom.
//
// Hovering lifts a photo above its neighbours and scales it up. Pure CSS — neither
// arrangement has any state, so this stays a Server Component.

import { SiteImage } from "@/components/SiteImage"
import { cn } from "@/lib/utils"

export type ImageStackLayout = "pile" | "cascade"

// Index 0 is the base photo in both. Each extra one gets its own offset and tilt, so the
// group looks dropped rather than arranged.
const PILE_POSITIONS = [
  "relative w-full",
  // The overhang is smaller on a phone, where the column is the full screen width.
  "absolute -bottom-4 right-0 w-2/5 rotate-6 sm:-right-3",
  "absolute -bottom-6 left-2 w-1/3 -rotate-6",
]

// Negative margins rather than absolute positioning, so the group is as tall as its
// photos and whatever follows it is pushed down rather than sitting underneath.
const CASCADE_POSITIONS = [
  "relative w-11/12 self-start",
  "relative -mt-5 w-4/5 self-end rotate-3",
  "relative -mt-5 w-3/4 self-start -rotate-3",
]

// A pile is read from its base up, so the base sits on top. A cascade is read downwards,
// so each photo has to cover the one above it.
const CASCADE_LAYERS = ["z-0", "z-10", "z-20"]

export function ImageStack({
  images,
  layout = "pile",
}: {
  images: string[]
  layout?: ImageStackLayout
}) {
  const isPile = layout === "pile"
  const positions = isPile ? PILE_POSITIONS : CASCADE_POSITIONS

  return (
    <div
      className={cn(
        "w-full",
        isPile ? "relative mb-10" : "flex flex-col items-stretch",
      )}
    >
      {images.slice(0, positions.length).map((image, index) => (
        <div
          key={`${image}-${index}`}
          className={cn(
            positions[index],
            "ring-background origin-center rounded-lg shadow-lg ring-4 transition-[transform,z-index] duration-1000 ease-out",
            // Raised above its neighbours while hovered, and nudged up as it grows.
            "hover:z-20 hover:-translate-y-2 hover:scale-110 hover:rotate-0",
            isPile ? (index === 0 ? "z-10" : "z-0") : CASCADE_LAYERS[index],
          )}
        >
          <SiteImage
            src={image}
            alt=""
            className={
              index === 0 && isPile
                ? "aspect-16/10 w-full"
                : "aspect-square w-full"
            }
            sizes="(min-width: 640px) 24rem, 90vw"
          />
        </div>
      ))}
    </div>
  )
}
