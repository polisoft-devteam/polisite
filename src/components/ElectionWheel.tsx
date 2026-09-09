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

import { usePathname } from "@/i18n/navigation"

import { Confetti } from "@/components/Confetti"
import { MemberAvatar } from "@/components/MemberAvatar"
import { Modal } from "@/components/Modal"
import { SignInButton } from "@/components/SignInButton"
import { NextSpinCountdown } from "@/components/NextSpinCountdown"
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

/** How long the lever stays down before it springs back. */
const LEVER_MS = 320

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

/**
 * The lever beside the wheel, for anyone who would rather pull than click.
 *
 * Drawn here for the same reason the wheel is: a rod, a ball and a base plate. It turns
 * about its own foot, which is what makes it read as a lever rather than as a falling
 * stick.
 */
function Lever({ isPulled }: { isPulled: boolean }) {
  return (
    <svg
      viewBox="0 0 40 170"
      aria-hidden="true"
      className="h-40 w-10 sm:h-56 sm:w-14"
    >
      {/* The housing it comes out of, so it has somewhere to be bolted to. */}
      <rect
        x="6"
        y="140"
        width="28"
        height="24"
        rx="6"
        fill="var(--muted)"
        stroke="var(--border)"
        strokeWidth="2"
      />

      <g
        className="origin-[20px_148px] transition-transform duration-200 ease-out motion-reduce:transition-none"
        style={{ transform: `rotate(${isPulled ? 32 : 0}deg)` }}
      >
        <rect
          x="16"
          y="34"
          width="8"
          height="112"
          rx="4"
          fill="var(--muted-foreground)"
        />
        <circle
          cx="20"
          cy="26"
          r="16"
          fill="var(--primary-ink)"
          stroke="var(--card)"
          strokeWidth="3"
        />
      </g>
    </svg>
  )
}

export function ElectionWheel({
  identity,
  maxSpins,
  isSignedOut,
  viewerName,
  viewerAvatarUrl,
  recordPick,
  placement = "corner",
}: {
  /** Changing hands starts the tally over; see adoptIdentity. */
  identity: string
  maxSpins: number
  isSignedOut: boolean
  /** Null for a visitor who has not signed in: there is no face to put under it. */
  viewerName: string | null
  viewerAvatarUrl: string | null
  /** Writes the result where the whole association can see it. Absent for a visitor. */
  recordPick?: (partyKey: string) => Promise<void>
  /**
   * "corner" is the one that follows you around the site and can be pushed aside.
   * "page" is the same wheel standing in the middle of /election, with nowhere to go.
   */
  placement?: "corner" | "page"
}) {
  const translateElection = useTranslations("Election")
  const currentPathname = usePathname()
  const { party, spinsLeft, tuckedChoice, isKnown } = useElectionWheelState()

  const [rotation, setRotation] = useState(SLICE_DEGREES / 2)
  const [durationMs, setDurationMs] = useState(SPIN_MS)
  const [isSpinning, setIsSpinning] = useState(false)
  const [celebrated, setCelebrated] = useState<Party | null>(null)
  const [isLeverPulled, setIsLeverPulled] = useState(false)
  const [isAskingToSignIn, setIsAskingToSignIn] = useState(false)
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
    adoptIdentity(identity, maxSpins)
  }, [identity, maxSpins])

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

  const isCorner = placement === "corner"
  const isElectionPage = currentPathname === "/election"

  // A wheel with nothing left to give folds itself away, unless the reader has said
  // otherwise. The tab still brings it back. The one on its own page never folds: it is
  // the reason the page exists.
  const isTucked = isCorner && (tuckedChoice ?? spinsLeft === 0)
  // Signing in is the price of a spin: a result belongs to somebody, and a browser is not
  // somebody. Not while it is pushed aside either: the wheel is off the edge, and the roll
  // it is holding would throw the landing off by exactly that much.
  const canSpin = !isSignedOut && spinsLeft > 0 && !isSpinning && !isTucked

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
        // Fire and forget: a result that fails to reach the table is still a result on
        // the screen and in this browser.
        void recordPick?.(landedOn.key)
        playPreparedSound(sound)
        playingSound.current = sound
      }, spinMs),
      window.setTimeout(() => fadeOutAndStop(sound), spinMs + SOUND_MS),
      window.setTimeout(() => {
        setCelebrated(null)

        // Nothing left to spin: the one in the corner rolls off on its own once the show
        // is over. The one standing on its own page stays where it is.
        if (isCorner && spinsLeft <= 1) tuckWheel(true)
      }, spinMs + CELEBRATION_MS),
    )
  }

  /** The lever goes down, springs back, and the wheel goes round. */
  function pullLever() {
    if (!canSpin) return

    setIsLeverPulled(true)
    timers.current.push(
      window.setTimeout(() => setIsLeverPulled(false), LEVER_MS),
    )

    spin()
  }

  // The rim keeps the tally the whole way, down to 0/3, and wears the answer instead of
  // its own name once there is one to wear. The short form goes after your name instead,
  // wherever your name is shown.
  const ribbonLabel =
    spinsLeft > 0
      ? translateElection("ribbon")
      : (party?.name ?? translateElection("ribbon"))
  // No tally for somebody who cannot spin: a count of what they are not allowed to use
  // reads as a promise the wheel does not keep.
  const ribbon = isSignedOut
    ? ribbonLabel
    : `${ribbonLabel} ${spinsLeft}/${Math.max(spinsLeft, maxSpins)}`

  const tooltip = isSignedOut
    ? translateElection("tooltipSignedOut")
    : party
      ? spinsLeft > 0
        ? translateElection("tooltipSpun", {
            party: party.name,
            count: spinsLeft,
          })
        : translateElection("tooltipSpent", { party: party.name })
      : translateElection("tooltipUnspun", { count: spinsLeft })

  // Nothing until the browser has answered; see isKnown.
  if (!isKnown) return null

  // One wheel per page: the corner keeps out of the way of the one on /election.
  if (isCorner && isElectionPage) return null

  return (
    <>
      {/* Two elements on purpose. The outer one is fixed and never transformed: a
          transform on a fixed box is where mobile browsers start anchoring it to the page
          instead of the screen. The inner one does the travelling, and is what the tab is
          positioned against. */}
      <div
        // Named, so a page transition animates around it instead of sweeping it into the
        // outgoing snapshot, which briefly painted the old page on top of it. Only the
        // corner one needs that: the page's own wheel goes with the page.
        style={isCorner ? { viewTransitionName: "election-wheel" } : undefined}
        // In the corner: flush with the bottom of a phone and over whatever is down there;
        // away from the corner on a desktop, and clear of the floating menu button in
        // between, which shows below md. Deaf to the pointer as a whole, because the wheel
        // is a circle drawn inside a square box and the box was swallowing clicks meant
        // for the page around it; the two things worth pressing turn their hearing back
        // on.
        className={cn(
          isCorner
            ? "pointer-events-none fixed right-0 bottom-0 z-[55] pb-[env(safe-area-inset-bottom)] sm:right-4 sm:bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:bottom-[calc(1rem+env(safe-area-inset-bottom))]"
            : "flex flex-col items-center",
        )}
      >
        <div
          className={cn(
            "relative flex items-center gap-1 transition-transform duration-700 ease-in-out motion-reduce:transition-none",
            isTucked && "translate-x-[calc(100%-3.5rem)]",
            !isCorner && "gap-2 sm:gap-4",
          )}
        >
          {/* A plain button rather than the design system's: this is a chevron and a logo
            sitting on the page, and the fill a real button carries would make it look like
            a control that belongs to the wheel. Focus still shows, hover does not.

            On the wheel's left edge while the wheel fills the screen, and back beside it
            from sm up, where there is room for both. */}
          {isCorner && (
            <button
              type="button"
              className="focus-visible:ring-ring/50 pointer-events-auto absolute top-1/2 left-0 z-10 flex -translate-y-1/2 cursor-pointer items-center gap-1 rounded-full outline-none focus-visible:ring-3 sm:static sm:translate-y-0"
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
                  src="/images/misc/election-logo.webp"
                  alt=""
                  className="h-5 w-7"
                  sizes="28px"
                  rounded="rounded-none"
                />
              </span>
            </button>
          )}

          {/* Signed out, the wheel is a way in rather than a dead control: pressing it
              asks for a Google account, which is the only thing standing between them and
              a spin. Signed in, it spins. */}
          {/* The wheel and the hints above it, as one thing to hover. The hints sit
            outside the button rather than inside it, because the button is clipped to the
            circle it draws so the page can be clicked around it, and a clip path takes
            the children with it. */}
          <span className="group/wheel relative">
            {/* aria-disabled rather than disabled: a spent wheel is still worth reading
              and still answers a keyboard, and nothing beside it inherits a dead
              state. */}
            <Tooltip
              label={tooltip}
              side="left"
              className="max-w-64 text-center"
            >
              <button
                type="button"
                onClick={spin}
                aria-disabled={!canSpin && !isSignedOut}
                aria-label={
                  spinsLeft > 0
                    ? translateElection("spin", { count: spinsLeft })
                    : translateElection("spent")
                }
                className={cn(
                  // The whole width of a phone, because a fairground wheel in a corner is a
                  // fairground wheel nobody spins. Clipped to the circle it draws, so the
                  // corners of its box belong to the page underneath.
                  "pointer-events-auto relative rounded-full [clip-path:circle(50%)]",
                  isCorner
                    ? "size-[100vw] sm:size-80"
                    : "size-[min(92vw,34rem)]",
                  canSpin || isSignedOut ? "cursor-pointer" : "cursor-default",
                )}
              >
                <Wedges
                  rotation={rotation + (isTucked ? ROLL_DEGREES : 0)}
                  durationMs={isSpinning ? durationMs : TUCK_MS}
                />
                <WheelFrame
                  ribbon={ribbon}
                  prompt={
                    spinsLeft > 0 ? translateElection("prompt") : undefined
                  }
                />
              </button>
            </Tooltip>

            {/* Sound, arrow, ears: the wheel makes a noise, so headphones are kind to
              whoever is beside you. Shown whatever the tally says, because the noise is
              the same on your last spin as on your first. They rise one after another
              while the pointer is on the wheel, and settle the same way when it leaves. */}
            <span
              aria-hidden="true"
              className="text-foreground pointer-events-none absolute -top-3.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5"
            >
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
          </span>

          {/* Beside the wheel rather than under it: a lever hangs off the side of the
              machine it belongs to. It does exactly what pressing the wheel does. */}
          {!isCorner && (
            <button
              type="button"
              onClick={pullLever}
              aria-disabled={!canSpin}
              aria-label={translateElection("lever")}
              className={cn(
                "self-center",
                canSpin || isSignedOut ? "cursor-pointer" : "cursor-default",
              )}
            >
              <Lever isPulled={isLeverPulled} />
            </button>
          )}
        </div>

        {/* Only where the wheel is the page: in the corner there is no room for a clock,
            and the tooltip already says the tally is spent. */}
        {!isCorner && spinsLeft === 0 && (
          <div className="mt-4 text-center">
            <NextSpinCountdown />
          </div>
        )}
      </div>

      {isAskingToSignIn && (
        <Modal
          open
          onOpenChange={(isOpen) => {
            if (!isOpen) setIsAskingToSignIn(false)
          }}
          title={translateElection("signInTitle")}
          description={translateElection("signInToSpin")}
          closeLabel={translateElection("close")}
          footerClassName="sm:justify-center"
          footer={<SignInButton />}
        />
      )}

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

            {/* Their own face, as big as the name above it and ringed in the party's
                colour: this is who the wheel just made a voter of. The ring takes
                currentColor, so it can be the party's own literal rather than a token
                that knows nothing about it. */}
            {viewerName && (
              <span
                className="inline-block rounded-full ring-4 ring-current"
                style={{ color: celebrated.color }}
              >
                <MemberAvatar
                  fullName={viewerName}
                  avatarUrl={viewerAvatarUrl}
                  className="size-24 text-3xl sm:size-32 sm:text-4xl"
                />
              </span>
            )}
          </div>

          <Confetti seed={rotation} />
        </>
      )}
    </>
  )
}
