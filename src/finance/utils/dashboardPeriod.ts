import type { DashboardPresetId, FinanceDashboardQuery } from '../types/DashboardDtos'

/** The presets every user gets, before the past years they have months in. */
export const BASE_DASHBOARD_PRESETS: DashboardPresetId[] = ['thisMonth', 'last3Months', 'last6Months', 'last12Months', 'thisYear']

export const DEFAULT_DASHBOARD_PRESET: DashboardPresetId = 'last6Months'

const LAST_N_MONTHS: Partial<Record<DashboardPresetId, number>> = {
  thisMonth: 1,
  last3Months: 3,
  last6Months: 6,
  last12Months: 12,
}

function toYearMonth(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`
}

/** `count` months ending with `today`'s month, as `yyyy-MM` bounds. */
function lastMonths(today: Date, count: number) {
  const end = new Date(today.getFullYear(), today.getMonth(), 1)
  const start = new Date(end.getFullYear(), end.getMonth() - (count - 1), 1)

  return {
    from: toYearMonth(start.getFullYear(), start.getMonth() + 1),
    to: toYearMonth(end.getFullYear(), end.getMonth() + 1),
  }
}

/**
 * Turns a preset into the months to ask for, from the user's local date (the backend never reads the clock).
 * "Last N months" includes the current month. "This year" is compared with the same months last year, so
 * Jan–Oct is measured against Jan–Oct rather than the months right before it.
 */
export function resolveDashboardPreset(preset: DashboardPresetId, today: Date): FinanceDashboardQuery {
  if (preset.startsWith('year:')) {
    const year = Number(preset.slice('year:'.length))
    return { from: toYearMonth(year, 1), to: toYearMonth(year, 12), comparison: 'PreviousPeriod' }
  }

  if (preset === 'thisYear') {
    return {
      from: toYearMonth(today.getFullYear(), 1),
      to: toYearMonth(today.getFullYear(), today.getMonth() + 1),
      comparison: 'SamePeriodLastYear',
    }
  }

  return { ...lastMonths(today, LAST_N_MONTHS[preset] ?? 1), comparison: 'PreviousPeriod' }
}

/** `year:2025` for every year before the current one the user has months in (newest first, as the API returns them). */
export function pastYearPresets(years: number[], today: Date): DashboardPresetId[] {
  return years.filter((year) => year < today.getFullYear()).map((year): DashboardPresetId => `year:${year}`)
}
