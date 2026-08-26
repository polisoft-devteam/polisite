// One to three photos in a pile: a large one with the others tilted on top.
//
// Hovering lifts a photo above its neighbours and scales it up. Pure CSS — the stack has no
// state, so it stays a Server Component.

import { SiteImage } from "@/components/SiteImage"
import { cn } from "@/lib/utils"

// Each extra photo gets its own offset and tilt, so a pile looks dropped rather than
// arranged. Index 0 is the base image.
// The overhang is smaller on a phone, where the column is the full screen width.
const STACK_POSITIONS = [
  "relative w-full",
  "absolute -bottom-4 right-0 w-2/5 rotate-6 sm:-right-3",
  "absolute -bottom-6 left-2 w-1/3 -rotate-6",
]

export function TimelineImageStack({ images }: { images: string[] }) {
  return (
    <div className="relative mb-10 w-full">
      {images.slice(0, STACK_POSITIONS.length).map((image, index) => (
        <div
          key={`${image}-${index}`}
          className={cn(
            STACK_POSITIONS[index],
            "ring-background origin-center rounded-lg shadow-lg ring-4 transition-[transform,z-index] duration-300 ease-out",
            // Raised above its neighbours while hovered, and nudged up as it grows.
            "hover:z-20 hover:-translate-y-2 hover:scale-110 hover:rotate-0",
            index === 0 ? "z-10" : "z-0",
          )}
        >
          <SiteImage
            src={image}
            alt=""
            className={
              index === 0 ? "aspect-16/10 w-full" : "aspect-square w-full"
            }
            sizes="(min-width: 640px) 24rem, 90vw"
          />
        </div>
      ))}
    </div>
  )
}
