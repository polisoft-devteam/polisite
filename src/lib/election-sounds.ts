// The sounds the wheel makes: one while it turns, and one per party for where it stops.
//
// A party's file is named after its key: public/sounds/<key>.mp3. No lookup table, so
// adding a party is a file with the right name and nothing else.
//
// The file is fetched when the spin starts and played when the wheel stops, so a fat mp3
// is already in hand by the time it is wanted. Everything here is optional: a missing
// file, a browser that refuses to play before the page has been clicked, a device with no
// audio at all, each ends as silence rather than as an error.

"use client"

import type { Party } from "@/lib/election"

/** Quiet on purpose: it plays unasked, beside something somebody may be reading. */
const VOLUME = 0.4

/** Under the result, which is the part worth hearing. */
const SPIN_VOLUME = 0.25

const SPIN_SOUND = "/sounds/wheel-spinning.mp3"

/**
 * Made once and kept, because its length decides how long the wheel turns for and that has
 * to be known before the click, not after it.
 */
export function prepareSpinSound(): HTMLAudioElement | null {
  try {
    const audio = new Audio(SPIN_SOUND)
    audio.volume = SPIN_VOLUME
    audio.load()

    return audio
  } catch {
    return null
  }
}

/** Null until the browser has read the file's header, and for a file that never arrives. */
export function soundLengthMs(audio: HTMLAudioElement | null): number | null {
  if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) {
    return null
  }

  return audio.duration * 1000
}

/** From the top, so the second spin sounds like the first. */
export function restartSound(audio: HTMLAudioElement | null) {
  if (!audio) return

  try {
    audio.currentTime = 0
    audio.volume = SPIN_VOLUME
  } catch {}

  void audio.play().catch(() => {})
}

export function preparePartySound(party: Party): HTMLAudioElement | null {
  try {
    const audio = new Audio(`/sounds/${party.key}.mp3`)
    audio.volume = VOLUME
    audio.load()

    return audio
  } catch {
    return null
  }
}

export function playPreparedSound(audio: HTMLAudioElement | null) {
  void audio?.play().catch(() => {})
}

/** Long enough not to sound like a dropped connection, short enough to be over with. */
const FADE_MS = 350

/**
 * Takes a clip out rather than cutting it dead.
 *
 * The files run from half a second to over half a minute, and the result is on the screen
 * for four, so the long ones have to be stopped somewhere. The volume is put back on the
 * way out, because the same element plays again if the wheel lands there twice.
 */
export function fadeOutAndStop(audio: HTMLAudioElement | null) {
  if (!audio || audio.paused) return

  const startVolume = audio.volume
  const startedAt = performance.now()

  const fade = window.setInterval(() => {
    const progress = (performance.now() - startedAt) / FADE_MS

    if (progress >= 1) {
      window.clearInterval(fade)
      audio.pause()
      audio.currentTime = 0
      audio.volume = startVolume
      return
    }

    audio.volume = startVolume * (1 - progress)
  }, 25)
}
