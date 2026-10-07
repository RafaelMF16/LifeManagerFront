import type { ApiErrorFieldMap } from '../../shared/utils/applyApiErrorToForm'
import type { RecurringTransactionFormValues } from './recurringTransactionSchema'

// Espelha os códigos de LifeManager.Domain/RecurringTransactions/Errors/RecurringTransactionErrors.cs,
// mais os de TransactionErrors que a recorrência reaproveita (tipo, descrição e valor).
export const RECURRING_TRANSACTION_NOT_FOUND_CODE = 'RecurringTransaction.NotFound'
export const RECURRING_TRANSACTION_CHANGED_CONCURRENTLY_CODE = 'RecurringTransaction.ChangedConcurrently'

export const recurringTransactionErrorFieldMap: ApiErrorFieldMap<RecurringTransactionFormValues> = {
  'Transaction.InvalidType': { field: 'type', message: 'finance:recurring.validation.type.invalid' },
  'Transaction.DescriptionIsNullOrWhiteSpace': { field: 'description', message: 'finance:recurring.validation.description.required' },
  'Transaction.DescriptionTooLong': { field: 'description', message: 'finance:recurring.validation.description.tooLong' },
  'Transaction.AmountNotPositive': { field: 'amount', message: 'finance:recurring.validation.amount.notPositive' },
  'Transaction.AmountTooManyDecimals': { field: 'amount', message: 'finance:recurring.validation.amount.tooManyDecimals' },
  'Transaction.AmountTooLarge': { field: 'amount', message: 'finance:recurring.validation.amount.tooLarge' },
  'RecurringTransaction.InvalidDay': { field: 'dayOfMonth', message: 'finance:recurring.validation.day.invalid' },
  'RecurringTransaction.InvalidStartMonth': { field: 'startMonth', message: 'finance:recurring.validation.startMonth.required' },
  'RecurringTransaction.StartInPast': { field: 'startMonth', message: 'finance:recurring.validation.startMonth.inPast' },
  'RecurringTransaction.StartLocked': { field: 'startMonth', message: 'finance:recurring.validation.startMonth.locked' },
  'RecurringTransaction.InvalidEndMonth': { field: 'endMonth', message: 'finance:recurring.validation.endMonth.invalid' },
  'RecurringTransaction.EndBeforeStart': { field: 'endMonth', message: 'finance:recurring.validation.endMonth.beforeStart' },
  // The chosen category was deleted (or never belonged to the user) after the options were loaded.
  'Category.NotFound': { field: 'categoryId', message: 'finance:recurring.validation.category.notFound' },
}
