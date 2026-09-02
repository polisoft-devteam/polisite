// The checkbox contract. An unticked checkbox sends nothing at all, so "absent" has to
// mean "no" — read it the other way round and unticking the Discord ping would still ping
// everyone, which is the one mistake here that cannot be taken back.

import { describe, expect, it } from "vitest"

import { readEventForm } from "@/features/events/schemas"

function formWith(entries: [string, string][]): FormData {
  const formData = new FormData()
  for (const [name, value] of entries) formData.append(name, value)
  return formData
}

describe("readEventForm", () => {
  it("does not announce when the box is unticked, so nothing is sent", () => {
    expect(readEventForm(formWith([])).announceOnDiscord).toBe(false)
  })

  it("announces only when the browser sends the ticked value", () => {
    expect(
      readEventForm(formWith([["announceOnDiscord", "on"]])).announceOnDiscord,
    ).toBe(true)
  })

  it("treats any other value as unticked rather than as truthy", () => {
    expect(
      readEventForm(formWith([["announceOnDiscord", "false"]]))
        .announceOnDiscord,
    ).toBe(false)
  })

  it("reads the online box the same way", () => {
    expect(readEventForm(formWith([])).isOnline).toBe(false)
    expect(readEventForm(formWith([["isOnline", "on"]])).isOnline).toBe(true)
  })

  it("keeps every ticked reminder, since the field repeats its name", () => {
    const form = formWith([
      ["reminderOffsets", "one_day"],
      ["reminderOffsets", "one_hour"],
    ])

    expect(readEventForm(form).reminderOffsets).toEqual(["one_day", "one_hour"])
  })
})
