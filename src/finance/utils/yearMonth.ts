// `yyyy-MM`, the backend's month format (LifeManager.Domain/Shared/ValueObjects/YearMonth.cs). Being zero-padded,
// two of them compare chronologically as plain strings ("2026-09" < "2026-10").

const YEAR_MONTH_PATTERN = /^(\d{4})-(\d{2})$/

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function formatYearMonth(year: number, month: number) {
  return `${year}-${pad(month)}`
}

/** The month of a local date, e.g. today's. */
export function toYearMonth(date: Date) {
  return formatYearMonth(date.getFullYear(), date.getMonth() + 1)
}

/** A local date (e.g. today's) as the backend's `DateOnly`, `YYYY-MM-DD`; never UTC, which may be another day. */
export function toIsoDate(date: Date) {
  return `${toYearMonth(date)}-${pad(date.getDate())}`
}

/** "2026-09" → { year: 2026, month: 9 }; null when it isn't a valid `yyyy-MM`. */
export function parseYearMonth(value: string | null | undefined) {
  const match = YEAR_MONTH_PATTERN.exec(value ?? '')
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  return month >= 1 && month <= 12 ? { year, month } : null
}

/** Moves a `yyyy-MM` by whole months, across years ("2026-12" + 1 → "2027-01"). */
export function addMonths(value: string, months: number) {
  const parsed = parseYearMonth(value)
  if (!parsed) return value

  const ordinal = parsed.year * 12 + parsed.month - 1 + months
  return formatYearMonth(Math.floor(ordinal / 12), (ordinal % 12) + 1)
}

/** The months before and after `month` inside a period (`yyyy-MM`, oldest first); null at either end. */
export function neighborMonths(months: string[], month: string) {
  const index = months.indexOf(month)
  if (index < 0) return { previous: null, next: null }

  return { previous: months[index - 1] ?? null, next: months[index + 1] ?? null }
}
