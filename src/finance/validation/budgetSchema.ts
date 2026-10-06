import { z } from 'zod'
import { parseYearMonth } from '../utils/yearMonth'
import { amountField } from './amountSchema'

// Espelha LifeManager.Domain/Budgets (Budget.Create, BudgetAmount.Create).
export const budgetSchema = z.object({
  type: z.enum(['Expense', 'Investment'], { message: 'finance:budgets.validation.type.invalid' }), // code: Budget.InvalidType
  /** Empty means a goal on the month's total. */
  categoryId: z.string(),
  // codes: Budget.AmountNotPositive, Budget.AmountTooManyDecimals, Budget.AmountTooLarge
  amount: amountField('finance:budgets.validation.amount'),
  from: z.string().refine((value) => parseYearMonth(value) !== null, {
    message: 'finance:budgets.validation.from.invalid', // code: Budget.InvalidMonth
  }),
})

export type BudgetFormValues = z.infer<typeof budgetSchema>
