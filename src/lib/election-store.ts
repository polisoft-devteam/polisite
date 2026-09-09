// What this browser remembers about the wheel: the party it landed on, how many of its
// three spins are gone, and whether it has been pushed off to the side.
//
// One key holding all three, because they change together and one snapshot is what
// useSyncExternalStore wants. The snapshot object is cached rather than rebuilt on every
// read: a fresh object each time is a new reference each time, which React reads as an
// endless stream of changes.
//
// Client only, hence the directive: election.ts holds the parties themselves, which the
// server renders too, and a module with a hook in it cannot be imported from there.

"use client"

import { useSyncExternalStore } from "react"

import { findParty, type Party } from "@/lib/election"
import { stockholmDay } from "@/lib/time"

const STORAGE_KEY = "polisite:election"

export type ElectionWheelState = {
  party: Party | null
  spinsLeft: number
  /**
   * The Stockholm day the spins were last handed out on, as "2026-09-13".
   *
   * A day, not a timestamp: "one a day" is a question about the calendar, and counting in
   * hours would give somebody in Denmark a different answer than somebody here.
   */
  grantedOn: string | null
  /**
   * What the reader chose, not where the wheel is: null means they never said, and a
   * spent wheel folds itself away in that case. Deciding here would lose the difference
   * between "put it away" and "never touched it".
   */
  tuckedChoice: boolean | null
  /**
   * False in the snapshot the server renders, true once the browser's own answer is in.
   *
   * The wheel draws nothing until it is true: rendering the server's "three spins, nothing
   * chosen" first made the question and its icons appear and then vanish on anyone who had
   * already spun. A flag on the snapshot rather than a mounted flag in state, because
   * setting state from an effect is what the React compiler refuses.
   */
  isKnown: boolean
  /**
   * Who this browser was when it spun: a member id, a plain sign in, or nobody at all.
   *
   * Signing in, or being let into the association, makes you someone else as far as the
   * wheel is concerned, and someone else gets three fresh spins. Null on anything stored
   * before this was kept, which is adopted rather than wiped.
   */
  identity: string | null
}

/** Also the server's answer: no browser, so nothing has been spun and nothing tucked. */
const UNTOUCHED: ElectionWheelState = {
  party: null,
  spinsLeft: 0,
  grantedOn: null,
  tuckedChoice: null,
  isKnown: false,
  identity: null,
}

/** A new day tops an empty wheel up to one. Nothing stockpiles while you are away. */
export const DAILY_SPINS = 1

let cachedState: ElectionWheelState | null = null

function readState(): ElectionWheelState {
  if (cachedState) return cachedState

  cachedState = { ...UNTOUCHED, isKnown: true }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return cachedState

    const parsed = JSON.parse(stored) as {
      partyKey?: string
      spinsLeft?: number
      grantedOn?: string | null
      isTucked?: boolean | null
      identity?: string | null
    }

    cachedState = {
      party: parsed.partyKey ? findParty(parsed.partyKey) : null,
      spinsLeft: parsed.spinsLeft ?? 0,
      grantedOn: parsed.grantedOn ?? null,
      tuckedChoice: parsed.isTucked ?? null,
      isKnown: true,
      identity: parsed.identity ?? null,
    }
  } catch {
    // A browser refusing storage, or a key someone edited by hand, is not worth failing a
    // page over.
  }

  return cachedState
}

function readServerState(): ElectionWheelState {
  return UNTOUCHED
}

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function writeState(next: ElectionWheelState) {
  cachedState = next

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        partyKey: next.party?.key ?? null,
        spinsLeft: next.spinsLeft,
        grantedOn: next.grantedOn,
        isTucked: next.tuckedChoice,
        identity: next.identity,
      }),
    )
  } catch {}

  listeners.forEach((listener) => listener())
}

/** What the wheel and the profile tag both read, so neither can show the stale half. */
export function useElectionWheelState(): ElectionWheelState {
  return useSyncExternalStore(subscribe, readState, readServerState)
}

export function recordSpin(party: Party) {
  const state = readState()

  writeState({ ...state, party, spinsLeft: Math.max(state.spinsLeft - 1, 0) })
}

/**
 * Hands the wheel to whoever is looking now, and starts them over if that is somebody new.
 *
 * A browser that has never recorded an identity keeps what it has: it belongs to the
 * person sitting there, we simply had not written down who that was.
 */
export function adoptIdentity(identity: string, startingSpins: number) {
  const state = readState()

  if (state.identity === identity) {
    // Same person, new day: see grantSpinsForToday.
    writeState(grantSpinsForToday(state, stockholmDay()))
    return
  }

  if (state.identity === null) {
    // Nothing was written down about who this browser belonged to, so it belongs to
    // whoever is here now, with whatever they have already spun.
    writeState(
      grantSpinsForToday(
        {
          ...state,
          identity,
          grantedOn: state.grantedOn ?? stockholmDay(),
          spinsLeft: state.grantedOn === null ? startingSpins : state.spinsLeft,
        },
        stockholmDay(),
      ),
    )
    return
  }

  writeState({
    party: null,
    spinsLeft: startingSpins,
    grantedOn: stockholmDay(),
    // Kept across the change of hands: pushing the wheel aside is a decision about this
    // screen, not about whoever is signed in, and signing out is a poor reason to have it
    // roll back out.
    tuckedChoice: state.tuckedChoice,
    isKnown: true,
    identity,
  })
}

/**
 * A spin a day, for anyone who has run out.
 *
 * Pure and exported so the rule can be tested without a browser or a clock. Somebody who
 * still has spins in hand keeps exactly those: the day tops an empty wheel up, it does not
 * hand out a second helping.
 */
export function grantSpinsForToday(
  state: ElectionWheelState,
  today: string,
): ElectionWheelState {
  if (state.grantedOn === today) return state

  return {
    ...state,
    spinsLeft: Math.max(state.spinsLeft, DAILY_SPINS),
    grantedOn: today,
  }
}

export function tuckWheel(isTucked: boolean) {
  writeState({ ...readState(), tuckedChoice: isTucked })
}
