// A photograph across the full width of the page, about half the screen tall, cut off at
// the bottom by a wave rather than a straight edge, with the page's title sitting on it.
//
// Two pages use it: the front page, which crossfades the folder of photos, and an event,
// which shows the one image it was given. Keyframes are generated here rather than kept in
// globals.css because each photo's share of the cycle depends on how many there are, so a
// hard-coded set would break the next time one is added.

import { SiteImage } from "@/components/SiteImage"
import { cn } from "@/lib/utils"

/** How long each photograph holds before the next fades in. */
const SECONDS_PER_PHOTO = 7

function crossfadeKeyframes(photoCount: number) {
  const share = 100 / photoCount

  return `@keyframes hero-fade {
  0% { opacity: 0 }
  ${(share * 0.12).toFixed(2)}% { opacity: 1 }
  ${(share * 0.88).toFixed(2)}% { opacity: 1 }
  ${share.toFixed(2)}% { opacity: 0 }
  100% { opacity: 0 }
}
@media (prefers-reduced-motion: reduce) {
  .hero-photo { animation: none !important; opacity: 0 }
  .hero-photo:first-child { opacity: 1 }
}`
}

export function PhotoHero({
  images,
  focalPoint,
  eyebrow,
  title,
  note,
  tagline,
  children,
}: {
  images: string[]
  /** Passed through to the photographs; see SiteImage. */
  focalPoint?: "center" | "upper" | "top" | "lower" | "bottom"
  /** Small label above the title, a category or a status. */
  eyebrow?: string
  title: string
  /** A status that belongs with the name, such as an event still being only a suggestion. */
  note?: React.ReactNode
  tagline?: string
  /** Sits under the tagline, for a call to action. */
  children?: React.ReactNode
}) {
  // One photo holds still. Fading a single image in and out would just blink it.
  const isCrossfading = images.length > 1
  const cycleSeconds = images.length * SECONDS_PER_PHOTO

  return (
    <section className="relative isolate">
      {isCrossfading && <style>{crossfadeKeyframes(images.length)}</style>}

      <div className="relative h-[36svh] min-h-[13rem] w-full overflow-hidden sm:h-[58svh] sm:min-h-[22rem]">
        {images.map((image, index) => (
          <span
            key={image}
            className={cn(
              "absolute inset-0 block",
              isCrossfading && "hero-photo",
            )}
            style={
              isCrossfading
                ? {
                    animation: `hero-fade ${cycleSeconds}s linear infinite`,
                    animationDelay: `${index * SECONDS_PER_PHOTO}s`,
                    opacity: 0,
                  }
                : undefined
            }
          >
            <SiteImage
              src={image}
              alt=""
              rounded=""
              focalPoint={focalPoint}
              priority={index === 0}
              className="size-full"
              sizes="100vw"
            />
          </span>
        ))}

        {/* Dark enough at the foot for the title to sit on any photograph. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-black/10"
        />

        <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-6xl px-4 pb-10 sm:pb-24 2xl:max-w-7xl">
          {eyebrow && (
            <p className="text-xs tracking-wide text-white/80 uppercase drop-shadow">
              {eyebrow}
            </p>
          )}

          <h1 className="font-heading text-4xl font-extrabold tracking-tight text-balance text-white drop-shadow-lg sm:text-6xl">
            {title}
          </h1>

          {note}

          {tagline && (
            <p className="mt-3 max-w-xl text-sm text-white/85 drop-shadow sm:text-base">
              {tagline}
            </p>
          )}

          {children && <div className="mt-4">{children}</div>}
        </div>
      </div>

      {/* The cut, filled with the page background so it works in either theme. Skipped on
          phones, where a shallow banner has no room to spare for it. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 130"
        preserveAspectRatio="none"
        className="text-background absolute inset-x-0 bottom-0 hidden h-[110px] w-full sm:block"
      >
        <path
          fill="currentColor"
          d="M0,130 L0,58 C240,110 420,10 720,44 C1010,77 1200,120 1440,52 L1440,130 Z"
        />
      </svg>
    </section>
  )
}
