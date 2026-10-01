import type { ApiErrorFieldMap } from '../../shared/utils/applyApiErrorToForm'
import type { MonthlySummaryFormValues } from './monthlySummarySchema'

// Espelha os códigos de LifeManager.Domain/MonthlySummaries/Errors/MonthlySummaryErrors.cs
export const monthlySummaryErrorFieldMap: ApiErrorFieldMap<MonthlySummaryFormValues> = {
  'MonthlySummary.InvalidMonth': { field: 'month', message: 'finance:months.validation.month.invalid' },
  'MonthlySummary.YearNotCurrent': { field: 'month', message: 'finance:months.validation.month.yearNotCurrent' },
  'MonthlySummary.AlreadyExists': { field: 'month', message: 'finance:months.validation.month.taken' },
}
