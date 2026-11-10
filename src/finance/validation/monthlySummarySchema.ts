import { z } from 'zod'

// Espelha LifeManager.Domain/MonthlySummaries/ValueObjects/MonthlySummaryMonth.cs (MonthlySummaryMonth.Create)
export const FIRST_MONTH = 1
export const LAST_MONTH = 12

/** Years a month can be created in by hand: the current one (first, the default) and the previous one. */
export function monthlySummaryYears(currentYear: number): number[] {
  return [currentYear, currentYear - 1]
}

// Espelha MonthlySummaryYear.Create(value, currentYear): o ano corrente ou o anterior (code: MonthlySummary.YearNotCurrent)
export function createMonthlySummarySchema(currentYear: number) {
  return z.object({
    month: z
      .number({ message: 'finance:months.validation.month.required' })
      .int()
      .min(FIRST_MONTH, { message: 'finance:months.validation.month.invalid' }) // code: MonthlySummary.InvalidMonth
      .max(LAST_MONTH, { message: 'finance:months.validation.month.invalid' }),
    year: z
      .number({ message: 'finance:months.validation.year.notAllowed' })
      .int({ message: 'finance:months.validation.year.notAllowed' })
      .min(currentYear - 1, { message: 'finance:months.validation.year.notAllowed' })
      .max(currentYear, { message: 'finance:months.validation.year.notAllowed' }),
  })
}

export type MonthlySummaryFormValues = z.infer<ReturnType<typeof createMonthlySummarySchema>>
