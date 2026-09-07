// Recording a spin where everyone else can see it.
//
// Every spin is a row of its own, because /election is a race: what you got today counts
// alongside what you got yesterday. The browser keeps the tally and the party it last
// landed on; this is the copy that reaches the standings.
//
// A visitor without a membership has no row to attach one to, and keeps their result to
// themselves.

"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { recordElectionVote } from "@/features/election/queries"
import { getViewer } from "@/lib/auth"
import { SWEDISH_PARTIES } from "@/lib/election"
import { canRecordElectionPick } from "@/lib/permissions"

const partyKeySchema = z.enum(
  SWEDISH_PARTIES.map((party) => party.key) as [string, ...string[]],
)

export async function recordElectionPickAction(partyKey: string) {
  const viewer = await getViewer()

  if (!canRecordElectionPick(viewer)) return

  const parsed = partyKeySchema.safeParse(partyKey)
  if (!parsed.success) return

  await recordElectionVote(viewer!.member!.id, parsed.data)

  revalidatePath("/election")
}
