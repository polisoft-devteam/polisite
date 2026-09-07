// The election wheel: a fairground wheel in the corner of every page until election day.
//
// No launcher and no panel. The wheel itself is the button, so the only thing to work out
// is that it turns. Beside it is a tab that pushes the whole thing off the edge, and pulls
// it back, for anyone who would rather get on with the site.
//
// You get three spins. The result arrives as paper over the page and the party's name
// across it, and then it settles onto your profile beside your title.
//
// Drawn here rather than pulled in as a library, for the same reason the calendar is: it
// is a dozen wedges and a rotation. Two stacked drawings, because the ribbon, the pointer
// and the hub have to hold still while the wedges turn under them.

"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"

import { Confetti } from "@/components/Confetti"
import { SiteImage } from "@/components/SiteImage"
import { Tooltip } from "@/components/Tooltip"
import {
  adoptIdentity,
  recordSpin,
  tuckWheel,
  useElectionWheelState,
} from "@/lib/election-store"
import { SWEDISH_PARTIES, type Party } from "@/lib/election"
import {
  fadeOutAndStop,
  playPreparedSound,
  preparePartySound,
  prepareSpinSound,
  restartSound,
  soundLengthMs,
} from "@/lib/election-sounds"
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SoundOnIcon,
  WearHeadphonesIcon,
} from "@/lib/icons"
import { cn } from "@/lib/utils"

const SLICE_DEGREES = 360 / SWEDISH_PARTIES.length

/** The lift the sound hints take while the pointer is on the wheel. */
const hintIcon =
  "size-5 transition-transform duration-300 ease-out group-hover/wheel:-translate-y-1.5 motion-reduce:transition-none"

/** Only used if the spinning clip cannot be measured: normally the sound sets the length. */
const SPIN_MS = 4200

/** Whole turns before it lands, drawn fresh each time so no two spins look alike. */
const FEWEST_TURNS = 6
const MOST_TURNS = 12

/** Pushing it aside and pulling it back, and the roll that goes with the journey. */
const TUCK_MS = 700
const ROLL_DEGREES = 200

/** How long the name stays across the page before it gets out of the way. A click takes
 * it away sooner, so this is only for whoever wants to sit and look at it. */
const CELEBRATION_MS = 7000

/** How long the party's clip plays for once the name is up. Some of them run for half a
 * minute, and nobody asked for half a minute, but two seconds was over before it had
 * started. It fades out a little before the name goes. */
const SOUND_MS = 6500

const CENTRE = 140
const WHEEL_RADIUS = 104
const RIBBON_RADIUS = 114
const RIBBON_WIDTH = 16

/** Outside the ribbon, where the question arches over the whole wheel. */
const PROMPT_RADIUS = 130

// The baseline sits inside the ribbon by half a cap height, because letters on a path grow
// outwards from it and would otherwise stand on top of the band rather than on it. Geometry
// rather than dy: WebKit ignores dy on a text path.
const RIBBON_TEXT_RADIUS = RIBBON_RADIUS - 5
const LABEL_RADIUS = 82

/** The axle: a flag with the year on it. */
const HUB_RADIUS = 26
const FLAG_BAR = 8

/** Degrees clockwise from twelve o'clock, where the pointer is, to a point on the wheel. */
function pointOnWheel(degrees: number, radius: number) {
  const radians = (degrees * Math.PI) / 180

  return {
    x: CENTRE + radius * Math.sin(radians),
    y: CENTRE - radius * Math.cos(radians),
  }
}

function sliceShape(index: number) {
  const start = pointOnWheel(index * SLICE_DEGREES, WHEEL_RADIUS)
  const end = pointOnWheel((index + 1) * SLICE_DEGREES, WHEEL_RADIUS)

  return `M ${CENTRE} ${CENTRE} L ${start.x} ${start.y} A ${WHEEL_RADIUS} ${WHEEL_RADIUS} 0 0 1 ${end.x} ${end.y} Z`
}

// The label follows its wedge round, so the ones on the lower half would end up on their
// heads. Those are turned about the label's own point, which flips the glyphs and leaves
// the position alone.
function labelTransform(index: number) {
  const middle = index * SLICE_DEGREES + SLICE_DEGREES / 2
  const isUpsideDown = middle > 90 && middle < 270
  const turn = `rotate(${middle} ${CENTRE} ${CENTRE})`

  return isUpsideDown
    ? `${turn} rotate(180 ${CENTRE} ${CENTRE - LABEL_RADIUS})`
    : turn
}

function Wedges({
  rotation,
  durationMs,
}: {
  rotation: number
  durationMs: number
}) {
  return (
    <svg
      viewBox="-15 -15 310 310"
      aria-hidden="true"
      className="absolute inset-0 size-full motion-reduce:!transition-none"
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: `transform ${durationMs}ms cubic-bezier(0.15, 0.85, 0.2, 1)`,
      }}
    >
      {SWEDISH_PARTIES.map((party, index) => (
        <g key={party.key}>
          <path
            d={sliceShape(index)}
            fill={party.color}
            stroke="var(--card)"
            strokeWidth="1.5"
          />
          <text
            x={CENTRE}
            y={CENTRE - LABEL_RADIUS}
            transform={labelTransform(index)}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11.5"
            fontWeight="700"
            fill={party.textColor}
          >
            {party.abbreviation}
          </text>
        </g>
      ))}
    </svg>
  )
}

/** The ribbon, the pointer and the hub: everything the turn must not carry round. */
function WheelFrame({
  ribbon,
  prompt,
}: {
  ribbon: string
  /** Left off once the spins are gone, when the question has been answered. */
  prompt?: string
}) {
  return (
    <svg
      viewBox="-15 -15 310 310"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full"
    >
      {prompt && (
        <>
          <path
            id="election-prompt-path"
            fill="none"
            d={`M ${CENTRE - PROMPT_RADIUS} ${CENTRE} A ${PROMPT_RADIUS} ${PROMPT_RADIUS} 0 0 1 ${CENTRE + PROMPT_RADIUS} ${CENTRE}`}
          />
          {/* White, outlined in the page's own ink so it reads over a pale background as
              well as a dark one. The outline stays thin: it is what clogs the letters, not
              the weight. */}
          {/* Plain ink, no outline. White needs a halo to survive a pale page, and the
              halo is what thickened the letters and fogged their counters. The token
              flips with the theme, so it reads dark on light and light on dark.

              Body font, not the heading one: only its heavy weights are loaded, so 500
              would snap back to 600. */}
          <text
            fill="var(--foreground)"
            fontSize="20"
            fontWeight="500"
            letterSpacing="0.5"
          >
            <textPath
              href="#election-prompt-path"
              startOffset="50%"
              textAnchor="middle"
            >
              {prompt}
            </textPath>
          </text>
        </>
      )}

      {/* The same colour as the gaps between the wedges, so rim and gaps read as one
          piece of white rather than a coloured hoop around a wheel. */}
      <circle
        cx={CENTRE}
        cy={CENTRE}
        r={RIBBON_RADIUS}
        fill="none"
        stroke="var(--card)"
        strokeWidth={RIBBON_WIDTH}
      />

      {/* Bent over the top of the ribbon, the way it is painted on a fairground wheel. */}
      <path
        id="election-ribbon-path"
        fill="none"
        d={`M ${CENTRE - RIBBON_TEXT_RADIUS} ${CENTRE} A ${RIBBON_TEXT_RADIUS} ${RIBBON_TEXT_RADIUS} 0 0 1 ${CENTRE + RIBBON_TEXT_RADIUS} ${CENTRE}`}
      />
      <text
        className="font-heading"
        fill="var(--foreground)"
        fontSize="14"
        fontWeight="800"
        letterSpacing="2"
        style={{ textTransform: "uppercase" }}
      >
        <textPath
          href="#election-ribbon-path"
          startOffset="50%"
          textAnchor="middle"
        >
          {ribbon}
        </textPath>
      </text>

      {/* Kept inside the wheel rather than out on the ribbon, where it would sit across
          the name. */}
      <path
        d={`M ${CENTRE - 9} ${CENTRE - WHEEL_RADIUS + 2} L ${CENTRE + 9} ${CENTRE - WHEEL_RADIUS + 2} L ${CENTRE} ${CENTRE - WHEEL_RADIUS + 18} Z`}
        fill="var(--foreground)"
      />

      {/* The axle: which election this is. The flag fills the whole circle and the year
          sits on it, outlined in the flag's own blue so it reads over the yellow cross as
          well as over the blue. */}
      <clipPath id="election-hub-clip">
        <circle cx={CENTRE} cy={CENTRE} r={HUB_RADIUS} />
      </clipPath>

      <g clipPath="url(#election-hub-clip)">
        <rect
          x={CENTRE - HUB_RADIUS}
          y={CENTRE - HUB_RADIUS}
          width={HUB_RADIUS * 2}
          height={HUB_RADIUS * 2}
          fill="#006aa7"
        />
        {/* The cross sits left of centre, as it does on the flag itself. */}
        <rect
          x={CENTRE - HUB_RADIUS * 0.38 - FLAG_BAR / 2}
          y={CENTRE - HUB_RADIUS}
          width={FLAG_BAR}
          height={HUB_RADIUS * 2}
          fill="#fecc00"
        />
        <rect
          x={CENTRE - HUB_RADIUS}
          y={CENTRE - FLAG_BAR / 2}
          width={HUB_RADIUS * 2}
          height={FLAG_BAR}
          fill="#fecc00"
        />
      </g>

      <circle
        cx={CENTRE}
        cy={CENTRE}
        r={HUB_RADIUS}
        fill="none"
        stroke="var(--card)"
        strokeWidth="3"
      />

      <text
        className="font-heading"
        x={CENTRE}
        y={CENTRE}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="20"
        fontWeight="800"
        fill="#ffffff"
        stroke="#006aa7"
        strokeWidth="2.5"
        strokeLinejoin="round"
        paintOrder="stroke"
      >
        26
      </text>
    </svg>
  )
}

export function ElectionWheel({
  identity,
  maxSpins,
  isSignedOut,
}: {
  /** Changing hands starts the tally over; see adoptIdentity. */
  identity: string
  maxSpins: number
  isSignedOut: boolean
}) {
  const translateElection = useTranslations("Election")
  const { party, spinsUsed, tuckedChoice, isKnown } = useElectionWheelState()

  const [rotation, setRotation] = useState(SLICE_DEGREES / 2)
  const [durationMs, setDurationMs] = useState(SPIN_MS)
  const [isSpinning, setIsSpinning] = useState(false)
  const [celebrated, setCelebrated] = useState<Party | null>(null)
  const timers = useRef<number[]>([])
  const playingSound = useRef<HTMLAudioElement | null>(null)
  const spinSound = useRef<HTMLAudioElement | null>(null)

  // Made once, because its length is what decides how long the wheel turns for, and that
  // has to be known before the click rather than after it.
  useEffect(() => {
    spinSound.current = prepareSpinSound()
  }, [])

  // Signing in, or being let in, starts the three over; see adoptIdentity.
  useEffect(() => {
    adoptIdentity(identity)
  }, [identity])

  useEffect(() => {
    const pending = timers.current

    return () => {
      pending.forEach((timer) => window.clearTimeout(timer))
      fadeOutAndStop(playingSound.current)
      fadeOutAndStop(spinSound.current)
    }
  }, [])

  // Dismissing the name takes the sound with it, however early.
  function dismissCelebration() {
    setCelebrated(null)
    fadeOutAndStop(playingSound.current)
  }

  const spinsLeft = Math.max(maxSpins - spinsUsed, 0)

  // A wheel with nothing left to give folds itself away, unless the reader has said
  // otherwise. The tab still brings it back.
  const isTucked = tuckedChoice ?? spinsLeft === 0
  // Not while it is pushed aside: the wheel is off the edge, and the roll it is holding
  // would throw the landing off by exactly that much.
  const canSpin = spinsLeft > 0 && !isSpinning && !isTucked

  function spin() {
    if (!canSpin) return

    // Whatever is still playing belongs to the last result, and the next one is four
    // seconds away.
    fadeOutAndStop(playingSound.current)

    const index = Math.floor(Math.random() * SWEDISH_PARTIES.length)
    const landedOn = SWEDISH_PARTIES[index] as Party
    const middle = index * SLICE_DEGREES + SLICE_DEGREES / 2

    // Where the wheel has to stop for that wedge to sit under the pointer, reached by
    // going forwards from wherever it is now, plus whole turns for the show.
    const landing = (360 - middle) % 360
    const wholeTurns =
      FEWEST_TURNS + Math.floor(Math.random() * (MOST_TURNS - FEWEST_TURNS + 1))
    const turns = wholeTurns * 360 + ((landing - (rotation % 360) + 360) % 360)

    const wantsStillness = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches

    // The wheel turns for exactly as long as the clip runs, so the two finish together.
    const spinMs = wantsStillness
      ? 0
      : (soundLengthMs(spinSound.current) ?? SPIN_MS)

    if (!wantsStillness) restartSound(spinSound.current)

    setDurationMs(spinMs)
    setRotation(rotation + turns)
    setIsSpinning(true)

    // Fetched now, played when it stops: four seconds is plenty of time for the file to
    // arrive, and a party that lands late has lost the moment.
    const sound = preparePartySound(landedOn)

    // The result is only told once the wheel has stopped, so nothing gives away what it
    // is still on its way to.
    timers.current.push(
      window.setTimeout(() => {
        fadeOutAndStop(spinSound.current)
        setIsSpinning(false)
        setCelebrated(landedOn)
        recordSpin(landedOn)
        playPreparedSound(sound)
        playingSound.current = sound
      }, spinMs),
      window.setTimeout(() => fadeOutAndStop(sound), spinMs + SOUND_MS),
      window.setTimeout(() => {
        setCelebrated(null)

        // Nothing left to spin: it rolls off on its own once the show is over.
        if (spinsLeft <= 1) tuckWheel(true)
      }, spinMs + CELEBRATION_MS),
    )
  }

  // The rim keeps the tally the whole way, down to 0/3, and wears the answer instead of
  // its own name once there is one to wear. The short form goes after your name instead,
  // wherever your name is shown.
  const ribbonLabel =
    spinsLeft > 0
      ? translateElection("ribbon")
      : (party?.name ?? translateElection("ribbon"))
  const ribbon = `${ribbonLabel} ${spinsLeft}/${maxSpins}`

  const tooltip = party
    ? spinsLeft > 0
      ? translateElection("tooltipSpun", {
          party: party.name,
          count: spinsLeft,
        })
      : isSignedOut
        ? translateElection("tooltipSpentGuest")
        : translateElection("tooltipSpent", { party: party.name })
    : translateElection("tooltipUnspun", { count: spinsLeft })

  // Nothing until the browser has answered; see isKnown.
  if (!isKnown) return null

  return (
    <>
      {/* Two elements on purpose. The outer one is fixed and never transformed: a
          transform on a fixed box is where mobile browsers start anchoring it to the page
          instead of the screen. The inner one does the travelling, and is what the tab is
          positioned against. */}
      <div
        // Named, so a page transition animates around it instead of sweeping it into the
        // outgoing snapshot, which briefly painted the old page on top of it.
        style={{ viewTransitionName: "election-wheel" }}
        // Flush with the bottom of a phone and over whatever is down there; away from the
        // corner on a desktop, and clear of the floating menu button in between, which
        // shows below md.
        className="fixed right-0 bottom-0 z-[55] pb-[env(safe-area-inset-bottom)] sm:right-4 sm:bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:bottom-[calc(1rem+env(safe-area-inset-bottom))]"
      >
        <div
          className={cn(
            "relative flex items-center gap-1 transition-transform duration-700 ease-in-out motion-reduce:transition-none",
            isTucked && "translate-x-[calc(100%-3.5rem)]",
          )}
        >
          {/* A plain button rather than the design system's: this is a chevron and a logo
            sitting on the page, and the fill a real button carries would make it look like
            a control that belongs to the wheel. Focus still shows, hover does not.

            On the wheel's left edge while the wheel fills the screen, and back beside it
            from sm up, where there is room for both. */}
          <button
            type="button"
            className="focus-visible:ring-ring/50 absolute top-1/2 left-0 z-10 flex -translate-y-1/2 cursor-pointer items-center gap-1 rounded-full outline-none focus-visible:ring-3 sm:static sm:translate-y-0"
            aria-label={
              isTucked
                ? translateElection("bringBack")
                : translateElection("tuckAway")
            }
            onClick={() => tuckWheel(!isTucked)}
          >
            {isTucked ? (
              <ChevronLeftIcon className="size-3" />
            ) : (
              <ChevronRightIcon className="size-3" />
            )}

            {/* A padded disc: the logo is 1665 by 1209, so a round frame around it would
              cut its sides off, and a round frame with room inside gives the tab its
              shape without touching the picture. */}
            <span className="bg-card ring-border flex size-11 items-center justify-center rounded-full shadow-sm ring-1">
              <SiteImage
                src="/images/misc/election-logo.png"
                alt=""
                className="h-5 w-7"
                sizes="28px"
                rounded="rounded-none"
              />
            </span>
          </button>

          {/* aria-disabled rather than disabled: a spent wheel is still worth reading and
            still answers a keyboard, and nothing beside it inherits a dead state. */}
          <Tooltip label={tooltip} side="left" className="max-w-64 text-center">
            <button
              type="button"
              onClick={spin}
              aria-disabled={!canSpin}
              aria-label={
                spinsLeft > 0
                  ? translateElection("spin", { count: spinsLeft })
                  : translateElection("spent")
              }
              className={cn(
                // The whole width of a phone, because a fairground wheel in a corner is a
                // fairground wheel nobody spins.
                "group/wheel relative size-[100vw] rounded-full sm:size-80",
                canSpin ? "cursor-pointer" : "cursor-default",
              )}
            >
              <Wedges
                rotation={rotation + (isTucked ? ROLL_DEGREES : 0)}
                durationMs={isSpinning ? durationMs : TUCK_MS}
              />
              <WheelFrame
                ribbon={ribbon}
                prompt={spinsLeft > 0 ? translateElection("prompt") : undefined}
              />

              {/* Sound, arrow, ears: the wheel makes a noise, so headphones are kind to
                whoever is beside you. Shown whatever the tally says, because the noise is
                the same on your last spin as on your first. Above the question rather than
                in the drawing, where an icon that small cannot be outlined enough to
                read. */}
              <span
                aria-hidden="true"
                className="text-foreground pointer-events-none absolute -top-3.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5"
              >
                {/* They rise one after another while the pointer is on the wheel, and
                  settle the same way when it leaves. A transition rather than a keyframe
                  hop, which snapped on and off as the pointer crossed the edge.

                  Deaf to the pointer: they are a note about the wheel, not part of it, and
                  a hand cursor over them promised a click that spun nothing. */}
                <SoundOnIcon className={hintIcon} />
                <ArrowRightIcon
                  className={cn(hintIcon, "size-3.5")}
                  style={{ transitionDelay: "80ms" }}
                />
                <WearHeadphonesIcon
                  className={hintIcon}
                  style={{ transitionDelay: "160ms" }}
                />
              </span>
            </button>
          </Tooltip>
        </div>
      </div>

      {celebrated && (
        <>
          {/* Over the page rather than beside the wheel: a result you have three of is
              worth stopping everything for. It goes on its own. */}
          <div
            className="fixed inset-0 z-90 flex flex-col items-center justify-center gap-4 bg-black/70 p-6 backdrop-blur-sm"
            onClick={dismissCelebration}
          >
            <p className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {translateElection("verdict")}
            </p>

            <p
              aria-live="polite"
              className="font-heading rotate-[-4deg] rounded-3xl px-8 py-6 text-center text-4xl font-extrabold tracking-tight text-balance shadow-xl sm:text-6xl"
              style={{
                backgroundColor: celebrated.color,
                color: celebrated.textColor,
              }}
            >
              {celebrated.name}
            </p>
          </div>

          <Confetti seed={rotation} />
        </>
      )}
    </>
  )
}
