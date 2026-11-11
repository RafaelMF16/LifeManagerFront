import type { ApiErrorFieldMap } from '../../shared/utils/applyApiErrorToForm'
import type { TransactionFormValues } from './transactionSchema'

// Espelha os códigos de LifeManager.Domain/Transactions/Errors/TransactionErrors.cs
export const TRANSACTION_NOT_FOUND_CODE = 'Transaction.NotFound'
export const MONTHLY_SUMMARY_NOT_FOUND_CODE = 'MonthlySummary.NotFound'

export const transactionErrorFieldMap: ApiErrorFieldMap<TransactionFormValues> = {
  'Transaction.InvalidType': { field: 'type', message: 'finance:transactions.validation.type.invalid' },
  'Transaction.DescriptionIsNullOrWhiteSpace': { field: 'description', message: 'finance:transactions.validation.description.required' },
  'Transaction.DescriptionTooLong': { field: 'description', message: 'finance:transactions.validation.description.tooLong' },
  'Transaction.AmountNotPositive': { field: 'amount', message: 'finance:transactions.validation.amount.notPositive' },
  'Transaction.AmountTooManyDecimals': { field: 'amount', message: 'finance:transactions.validation.amount.tooManyDecimals' },
  'Transaction.AmountTooLarge': { field: 'amount', message: 'finance:transactions.validation.amount.tooLarge' },
  'Transaction.DateOutsideMonth': { field: 'date', message: 'finance:transactions.validation.date.outsideMonth' },
  // The chosen category was deleted (or never belonged to the user) after the options were loaded.
  'Category.NotFound': { field: 'categoryId', message: 'finance:transactions.validation.category.notFound' },
  // The goal was deleted or archived after the options were loaded, or the type changed under it.
  'SavingsGoal.NotFound': { field: 'savingsGoalId', message: 'finance:transactions.validation.goal.notFound' },
  'SavingsGoal.Archived': { field: 'savingsGoalId', message: 'finance:transactions.validation.goal.archived' },
  'Transaction.GoalRequiresInvestment': { field: 'savingsGoalId', message: 'finance:transactions.validation.goal.requiresInvestment' },
}

/** The quick entry (`POST /api/Transactions`) may also be refused the month it would open. */
export const quickTransactionErrorFieldMap: ApiErrorFieldMap<TransactionFormValues> = {
  ...transactionErrorFieldMap,
  'MonthlySummary.YearNotCurrent': { field: 'date', message: 'finance:transactions.validation.date.yearNotCurrent' },
}
