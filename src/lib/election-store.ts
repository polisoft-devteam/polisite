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

const STORAGE_KEY = "polisite:election"

export type ElectionWheelState = {
  party: Party | null
  spinsUsed: number
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
  spinsUsed: 0,
  tuckedChoice: null,
  isKnown: false,
  identity: null,
}

let cachedState: ElectionWheelState | null = null

function readState(): ElectionWheelState {
  if (cachedState) return cachedState

  cachedState = { ...UNTOUCHED, isKnown: true }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return cachedState

    const parsed = JSON.parse(stored) as {
      partyKey?: string
      spinsUsed?: number
      isTucked?: boolean | null
      identity?: string | null
    }

    cachedState = {
      party: parsed.partyKey ? findParty(parsed.partyKey) : null,
      spinsUsed: parsed.spinsUsed ?? 0,
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
        spinsUsed: next.spinsUsed,
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

  writeState({ ...state, party, spinsUsed: state.spinsUsed + 1 })
}

/**
 * Hands the wheel to whoever is looking now, and starts them over if that is somebody new.
 *
 * A browser that has never recorded an identity keeps what it has: it belongs to the
 * person sitting there, we simply had not written down who that was.
 */
export function adoptIdentity(identity: string) {
  const state = readState()

  if (state.identity === identity) return

  if (state.identity === null) {
    writeState({ ...state, identity })
    return
  }

  writeState({
    party: null,
    spinsUsed: 0,
    tuckedChoice: null,
    isKnown: true,
    identity,
  })
}

export function tuckWheel(isTucked: boolean) {
  writeState({ ...readState(), tuckedChoice: isTucked })
}
