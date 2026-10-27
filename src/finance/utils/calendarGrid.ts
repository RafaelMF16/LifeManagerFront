import { parseYearMonth } from './yearMonth'

/** A month laid out as weeks of 7 cells, Sunday first: ISO `YYYY-MM-DD` days, null outside the month. */
export type CalendarWeek = (string | null)[]

const DAYS_PER_WEEK = 7

function pad(value: number) {
  return String(value).padStart(2, '0')
}

/** The weeks of a `yyyy-MM` month, Sunday first; empty for an invalid month. */
export function calendarGrid(yearMonth: string): CalendarWeek[] {
  const parsed = parseYearMonth(yearMonth)
  if (!parsed) return []

  // UTC so the weekday doesn't depend on the device's time zone.
  const leadingBlanks = new Date(Date.UTC(parsed.year, parsed.month - 1, 1)).getUTCDay()
  const dayCount = new Date(Date.UTC(parsed.year, parsed.month, 0)).getUTCDate()

  const cells: (string | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: dayCount }, (_, index) => `${yearMonth}-${pad(index + 1)}`),
  ]
  while (cells.length % DAYS_PER_WEEK !== 0) cells.push(null)

  return Array.from({ length: cells.length / DAYS_PER_WEEK }, (_, week) =>
    cells.slice(week * DAYS_PER_WEEK, (week + 1) * DAYS_PER_WEEK),
  )
}
