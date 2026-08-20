// Month-grid arithmetic for the calendar page.
//
// All of it is in UTC on purpose. date-fns counts in local time, so on a machine ahead of
// UTC a UTC-midnight date rolls back to the previous day and the whole grid shifts by
// one square. Calendar squares are dates, not instants, so UTC midnight is the right
// anchor and the maths must agree.

const DAY_IN_MS = 24 * 60 * 60 * 1000

/** Always six rows, so the grid doesn't change height from month to month. */
export const WEEKS_IN_MONTH_GRID = 6

export function startOfMonthUtc(year: number, monthIndex: number): Date {
  return new Date(Date.UTC(year, monthIndex, 1))
}

export function addMonthsUtc(month: Date, count: number): Date {
  return startOfMonthUtc(month.getUTCFullYear(), month.getUTCMonth() + count)
}

export function toDayKey(day: Date): string {
  return day.toISOString().slice(0, 10)
}

/** "2026-09" → that month at UTC midnight. Anything else → the current month. */
export function parseMonthParam(value: string | undefined): Date {
  if (value && /^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split("-").map(Number)

    if (month >= 1 && month <= 12) {
      return startOfMonthUtc(year, month - 1)
    }
  }

  const now = new Date()
  return startOfMonthUtc(now.getUTCFullYear(), now.getUTCMonth())
}

export function toMonthParam(month: Date): string {
  return toDayKey(month).slice(0, 7)
}

/**
 * The 42 days a month grid shows, Monday first, starting on the Monday on or before the
 * first of the month. Sweden reads calendars Monday-first.
 */
export function buildMonthGridDays(month: Date): Date[] {
  const firstOfMonth = startOfMonthUtc(
    month.getUTCFullYear(),
    month.getUTCMonth(),
  )

  // getUTCDay() is 0 for Sunday; shift so Monday is 0.
  const daysSinceMonday = (firstOfMonth.getUTCDay() + 6) % 7
  const gridStart = new Date(
    firstOfMonth.getTime() - daysSinceMonday * DAY_IN_MS,
  )

  return Array.from(
    { length: WEEKS_IN_MONTH_GRID * 7 },
    (_, index) => new Date(gridStart.getTime() + index * DAY_IN_MS),
  )
}
