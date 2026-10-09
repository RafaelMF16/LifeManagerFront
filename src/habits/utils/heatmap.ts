import type { HabitDayDto, HabitDayState } from '../types/HabitStatsDtos'

/** One heatmap column: Monday to Sunday; null where the week runs outside the days shown. */
export type HeatmapWeek = (HabitDayDto | null)[]

function toUtcDate(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

/** 0 for Monday … 6 for Sunday. */
export function weekdayIndex(date: string) {
  return (toUtcDate(date).getUTCDay() + 6) % 7
}

/**
 * Lays the days (oldest first, consecutive) out as calendar columns, Monday first: the first column is padded before
 * the first day and the last one after the last day (today), so every column is a whole week.
 */
export function heatmapWeeks(days: readonly HabitDayDto[]): HeatmapWeek[] {
  if (days.length === 0) return []

  const slots: (HabitDayDto | null)[] = [...Array<null>(weekdayIndex(days[0].date)).fill(null), ...days]
  while (slots.length % 7 !== 0) slots.push(null)

  const weeks: HeatmapWeek[] = []
  for (let start = 0; start < slots.length; start += 7) weeks.push(slots.slice(start, start + 7))
  return weeks
}

/** Columns a month label needs, so the next one doesn't overlap it. */
const MONTH_LABEL_COLUMNS = 3

/**
 * The month label over each column: on every column holding a month's 1st day, and on the first column unless the
 * next month's label comes too soon after it; empty elsewhere. "out", "nov" in `locale`.
 */
export function monthLabels(weeks: readonly HeatmapWeek[], locale: string): string[] {
  const format = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' })
  const label = (day: HabitDayDto | undefined) => (day ? format.format(toUtcDate(day.date)).replace('.', '') : '')

  const labels = weeks.map((week) => label(week.find((day) => day?.date.endsWith('-01')) ?? undefined))
  const firstMonthStart = labels.findIndex((value) => value !== '')
  if (labels.length > 0 && labels[0] === '' && (firstMonthStart === -1 || firstMonthStart >= MONTH_LABEL_COLUMNS)) {
    labels[0] = label(weeks[0].find((day) => day !== null) ?? undefined)
  }
  return labels
}

/** How many days are in each state, for the legend. */
export function stateCounts(days: readonly HabitDayDto[]): Partial<Record<HabitDayState, number>> {
  const counts: Partial<Record<HabitDayState, number>> = {}
  for (const day of days) counts[day.state] = (counts[day.state] ?? 0) + 1
  return counts
}

/** "Wed, Oct 7" for a `yyyy-MM-dd` day, in `locale`. */
export function formatHeatmapDay(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(toUtcDate(date))
}
