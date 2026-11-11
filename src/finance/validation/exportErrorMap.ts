import type { ApiErrorFieldMap } from '../../shared/utils/applyApiErrorToForm'
import type { ExportFormValues } from './exportSchema'

// Espelha os códigos de período de LifeManager.Domain/FinanceDashboard/Errors/FinanceDashboardErrors.cs, que a
// exportação de lançamentos reaproveita (sem códigos próprios).
export const exportErrorFieldMap: ApiErrorFieldMap<ExportFormValues> = {
  'FinanceDashboard.InvalidFrom': { field: 'from', message: 'finance:export.validation.from.invalid' },
  'FinanceDashboard.InvalidTo': { field: 'to', message: 'finance:export.validation.to.invalid' },
  'FinanceDashboard.EndBeforeStart': { field: 'to', message: 'finance:export.validation.to.beforeFrom' },
  'FinanceDashboard.PeriodTooLong': { field: 'to', message: 'finance:export.validation.to.tooLong' },
}

/** The rate limit (10 exports per 10 minutes): the dialog shows it as the form's error, the period itself is fine. */
export const EXPORT_TOO_MANY_REQUESTS_CODE = 'Auth.TooManyRequests'
