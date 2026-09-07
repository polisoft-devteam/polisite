/**
 * Levels the party clips under public/sounds so one does not blast after another whispers.
 *
 *   pnpm sounds:normalize
 *
 * Loudness is measured over the opening seconds rather than the whole file, because that
 * is all the wheel ever plays: a clip that starts quiet and builds would otherwise measure
 * as loud and be turned down further. The gain is then applied to the whole file, so the
 * rest still sounds like itself.
 *
 * Safe to re-run: anything already within half a decibel of the target is left alone,
 * which matters because every pass re-encodes.
 *
 * Needs ffmpeg on PATH.
 */

import { execFile } from "node:child_process"
import { readdir, rename, unlink } from "node:fs/promises"
import path from "node:path"
import { promisify } from "node:util"

const run = promisify(execFile)

const SOUNDS_DIR = "public/sounds"

/** Where the wheel stops the clip, so the window that decides the level. */
const MEASURED_SECONDS = 2.5

/** Broadcast-ish loudness. Quiet enough for a corner of a page, loud enough to hear. */
const TARGET_LUFS = -16

/** Below this the change is inaudible and the re-encode is pure loss. */
const MINIMUM_CHANGE_DB = 0.5

/** A clip that needs more than this is broken, not quiet. */
const MAXIMUM_GAIN_DB = 20

async function measureLoudness(file: string): Promise<number | null> {
  // loudnorm prints its measurements to stderr as JSON and writes no audio anywhere.
  const { stderr } = await run("ffmpeg", [
    "-i",
    file,
    "-t",
    String(MEASURED_SECONDS),
    "-af",
    `loudnorm=I=${TARGET_LUFS}:TP=-1.5:LRA=11:print_format=json`,
    "-f",
    "null",
    "-",
  ])

  const json = stderr.slice(
    stderr.lastIndexOf("{"),
    stderr.lastIndexOf("}") + 1,
  )
  const measured = Number(JSON.parse(json).input_i)

  return Number.isFinite(measured) ? measured : null
}

const files = (await readdir(SOUNDS_DIR)).filter((name) =>
  name.endsWith(".mp3"),
)
let levelled = 0

for (const name of files.sort()) {
  const file = path.join(SOUNDS_DIR, name)
  const measured = await measureLoudness(file)

  if (measured === null) {
    console.log(`${name.padEnd(12)} silent, left alone`)
    continue
  }

  const gain = Math.max(
    Math.min(TARGET_LUFS - measured, MAXIMUM_GAIN_DB),
    -MAXIMUM_GAIN_DB,
  )

  if (Math.abs(gain) < MINIMUM_CHANGE_DB) {
    console.log(`${name.padEnd(12)} ${measured.toFixed(1)} LUFS, already level`)
    continue
  }

  const levelledFile = path.join(SOUNDS_DIR, `${name}.levelled.mp3`)

  await run("ffmpeg", [
    "-y",
    "-i",
    file,
    "-af",
    `volume=${gain.toFixed(2)}dB`,
    "-c:a",
    "libmp3lame",
    "-q:a",
    "4",
    levelledFile,
  ])

  await unlink(file)
  await rename(levelledFile, file)
  levelled += 1

  console.log(
    `${name.padEnd(12)} ${measured.toFixed(1)} LUFS ${gain > 0 ? "+" : ""}${gain.toFixed(1)} dB`,
  )
}

console.log(`\n${levelled} of ${files.length} levelled.`)
