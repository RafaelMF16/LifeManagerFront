import { addMonths } from '../yearMonth'

/**
 * The month a row counts in when "count in the next month" is on: the one after its date's ("2026-12-30" → "2027-01").
 * Mirrors StatementImportRow.EffectiveDate (LifeManager.Domain), the first day of that month.
 */
export function nextMonthOf(isoDate: string) {
  return addMonths(isoDate.slice(0, 7), 1)
}
