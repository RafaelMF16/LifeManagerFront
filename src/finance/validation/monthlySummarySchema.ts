import { z } from 'zod'

// Espelha LifeManager.Domain/MonthlySummaries/ValueObjects/MonthlySummaryMonth.cs (MonthlySummaryMonth.Create)
export const FIRST_MONTH = 1
export const LAST_MONTH = 12

export const monthlySummarySchema = z.object({
  month: z
    .number({ message: 'finance:months.validation.month.required' })
    .int()
    .min(FIRST_MONTH, { message: 'finance:months.validation.month.invalid' }) // code: MonthlySummary.InvalidMonth
    .max(LAST_MONTH, { message: 'finance:months.validation.month.invalid' }),
})

export type MonthlySummaryFormValues = z.infer<typeof monthlySummarySchema>
