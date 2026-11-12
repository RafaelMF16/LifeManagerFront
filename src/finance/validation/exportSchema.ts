import { z } from 'zod'
import { parseYearMonth } from '../utils/yearMonth'

// Espelha LifeManager.Domain/FinanceDashboard/ValueObjects/DashboardPeriod.cs, que a exportação reaproveita.
export const EXPORT_MAX_MONTHS = 36

export const EXPORT_TYPES = ['All', 'Expense', 'Income', 'Investment'] as const
export const EXPORT_FORMATS = ['PtBr', 'EnUs'] as const

export type ExportType = (typeof EXPORT_TYPES)[number]
export type ExportFormat = (typeof EXPORT_FORMATS)[number]

/** How many months `from` to `to` spans, both included (`yyyy-MM`); 0 when either is invalid or `to` comes first. */
export function exportMonthCount(from: string, to: string): number {
  const start = parseYearMonth(from)
  const end = parseYearMonth(to)
  if (!start || !end) return 0

  const count = end.year * 12 + end.month - (start.year * 12 + start.month) + 1
  return Math.max(count, 0)
}

export const exportSchema = z
  .object({
    from: z.string().refine((value) => parseYearMonth(value) !== null, {
      message: 'finance:export.validation.from.invalid', // code: FinanceDashboard.InvalidFrom
    }),
    to: z.string().refine((value) => parseYearMonth(value) !== null, {
      message: 'finance:export.validation.to.invalid', // code: FinanceDashboard.InvalidTo
    }),
    type: z.enum(EXPORT_TYPES),
    format: z.enum(EXPORT_FORMATS),
  })
  .refine((values) => parseYearMonth(values.from) === null || parseYearMonth(values.to) === null || values.to >= values.from, {
    path: ['to'],
    message: 'finance:export.validation.to.beforeFrom', // code: FinanceDashboard.EndBeforeStart
  })
  .refine((values) => exportMonthCount(values.from, values.to) <= EXPORT_MAX_MONTHS, {
    path: ['to'],
    message: 'finance:export.validation.to.tooLong', // code: FinanceDashboard.PeriodTooLong
  })

export type ExportFormValues = z.infer<typeof exportSchema>
