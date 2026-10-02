// The sound a vote makes on /compet: public/sounds/compet-vote.mp3.
//
// Fetched when the form mounts and played when the vote is in, so it is already loaded.
// Optional, like the wheel's: no file, or a browser that refuses to play, is silence.

"use client"

const VOTE_SOUND = "/sounds/compet-vote.mp3"

/** Quiet on purpose, as the wheel's are: it plays beside something somebody is reading. */
const VOLUME = 0.4

export function prepareCompetVoteSound(): HTMLAudioElement | null {
  try {
    const audio = new Audio(VOTE_SOUND)
    audio.volume = VOLUME
    audio.load()

    return audio
  } catch {
    return null
  }
}

/** From the top, so three votes in a row sound like three votes. */
export function playCompetVoteSound(audio: HTMLAudioElement | null) {
  if (!audio) return

  try {
    audio.currentTime = 0
  } catch {}

  void audio.play().catch(() => {})
}
