# Sounds

`wheel-spinning.mp3` plays while the wheel turns, and its length is what decides how long
the wheel turns for: replace it with a longer clip and the spin gets longer to match.

The rest are one per party, played when the wheel stops on it. The file is named after the party's key
in `src/lib/election.ts`, so `l.mp3` plays for Liberalerna and `nyans.mp3` for Partiet
Nyans. Adding a party means adding a file with the matching name; nothing in the code
lists them.

Keep them short: only the first two seconds are ever heard, and the clip is faded out
there. After adding one, run

    pnpm sounds:normalize

which levels every file to the same loudness so one party cannot blast after another
whispers. It measures the opening seconds, which is the part that plays, and is safe to
re-run. `src/lib/election-sounds.ts` sets the volume everything is played at.

A party with no file simply lands in silence.
