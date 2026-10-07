import { z } from 'zod'
import { parseYearMonth } from '../utils/yearMonth'
import { amountField } from './amountSchema'
import { TRANSACTION_DESCRIPTION_MAX_LENGTH } from './transactionSchema'

// Espelha LifeManager.Domain/RecurringTransactions (RecurrenceDay.Create e as regras de mês de RecurringTransaction.Create).
export const RECURRENCE_FIRST_DAY = 1
export const RECURRENCE_LAST_DAY = 31

const DAY_PATTERN = /^\d{1,2}$/

/**
 * `minStartMonth` is the earliest start the form accepts (`yyyy-MM`): the current month when creating; when
 * editing, the stored start too, so an unchanged start that is in the past by now still validates.
 */
export function createRecurringTransactionSchema(minStartMonth: string) {
  return z
    .object({
      type: z.enum(['Expense', 'Income', 'Investment'], { message: 'finance:recurring.validation.type.invalid' }), // code: Transaction.InvalidType
      description: z
        .string()
        .trim()
        .min(1, { message: 'finance:recurring.validation.description.required' }) // code: Transaction.DescriptionIsNullOrWhiteSpace
        .max(TRANSACTION_DESCRIPTION_MAX_LENGTH, { message: 'finance:recurring.validation.description.tooLong' }), // code: Transaction.DescriptionTooLong
      // codes: Transaction.AmountNotPositive, Transaction.AmountTooManyDecimals, Transaction.AmountTooLarge
      amount: amountField('finance:recurring.validation.amount'),
      dayOfMonth: z
        .string()
        .trim()
        .refine(
          (value) => DAY_PATTERN.test(value) && Number(value) >= RECURRENCE_FIRST_DAY && Number(value) <= RECURRENCE_LAST_DAY,
          { message: 'finance:recurring.validation.day.invalid' }, // code: RecurringTransaction.InvalidDay
        ),
      categoryId: z.string().min(1, { message: 'finance:recurring.validation.category.required' }),
      startMonth: z
        .string()
        .refine((value) => parseYearMonth(value) !== null, { message: 'finance:recurring.validation.startMonth.required' }) // code: RecurringTransaction.InvalidStartMonth
        .refine((value) => value >= minStartMonth, { message: 'finance:recurring.validation.startMonth.inPast' }), // code: RecurringTransaction.StartInPast
      /** Empty means it never ends. */
      endMonth: z.string().refine((value) => value === '' || parseYearMonth(value) !== null, {
        message: 'finance:recurring.validation.endMonth.invalid', // code: RecurringTransaction.InvalidEndMonth
      }),
    })
    .refine((values) => values.endMonth === '' || values.endMonth >= values.startMonth, {
      path: ['endMonth'],
      message: 'finance:recurring.validation.endMonth.beforeStart', // code: RecurringTransaction.EndBeforeStart
    })
}

export type RecurringTransactionFormValues = z.infer<ReturnType<typeof createRecurringTransactionSchema>>
