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

/**
 * Where the calendar's focus goes for a key: ←/→ a day, ↑/↓ a week, Home/End the week's first/last day in the month.
 * `lastSelectable` (the last day that can be picked, e.g. today) caps it; null means stay put.
 */
export function calendarKeyTarget(weeks: CalendarWeek[], date: string, key: string, lastSelectable: string): string | null {
  const cells = weeks.flat()
  const index = cells.indexOf(date)
  if (index < 0) return null

  const weekStart = index - (index % DAYS_PER_WEEK)
  const week = cells.slice(weekStart, weekStart + DAYS_PER_WEEK).filter((cell): cell is string => cell !== null)
  const pickable = (cell: string | null | undefined) => (cell && cell <= lastSelectable ? cell : null)

  switch (key) {
    case 'ArrowRight':
      return pickable(cells[index + 1])
    case 'ArrowLeft':
      return pickable(cells[index - 1])
    case 'ArrowDown':
      return pickable(cells[index + DAYS_PER_WEEK])
    case 'ArrowUp':
      return pickable(cells[index - DAYS_PER_WEEK])
    case 'Home':
      return pickable(week[0])
    case 'End':
      return week.filter((cell) => cell <= lastSelectable).at(-1) ?? null
    default:
      return null
  }
}
