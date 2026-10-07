import { z } from 'zod'
import { amountField } from './amountSchema'

// Espelha LifeManager.Domain/Transactions/ValueObjects (TransactionDescription.Create, TransactionAmount.Create)
// e a regra de data de Transaction.Create.
export const TRANSACTION_DESCRIPTION_MAX_LENGTH = 80

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

/** `YYYY-MM-DD` of the first and last day of the month, for the date input's min/max. */
export function monthDateRange(year: number, month: number) {
  const pad = (value: number) => String(value).padStart(2, '0')
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return { min: `${year}-${pad(month)}-01`, max: `${year}-${pad(month)}-${pad(lastDay)}` }
}

/** The form validates the date against the month it belongs to, so the schema is built per month. */
export function createTransactionSchema(year: number, month: number) {
  const { min, max } = monthDateRange(year, month)

  return z.object({
    type: z.enum(['Expense', 'Income', 'Investment'], { message: 'finance:transactions.validation.type.invalid' }), // code: Transaction.InvalidType
    description: z
      .string()
      .trim()
      .min(1, { message: 'finance:transactions.validation.description.required' }) // code: Transaction.DescriptionIsNullOrWhiteSpace
      .max(TRANSACTION_DESCRIPTION_MAX_LENGTH, { message: 'finance:transactions.validation.description.tooLong' }), // code: Transaction.DescriptionTooLong
    // codes: Transaction.AmountNotPositive, Transaction.AmountTooManyDecimals, Transaction.AmountTooLarge
    amount: amountField('finance:transactions.validation.amount'),
    date: z
      .string()
      .min(1, { message: 'finance:transactions.validation.date.required' })
      .refine((value) => DATE_PATTERN.test(value) && value >= min && value <= max, {
        message: 'finance:transactions.validation.date.outsideMonth', // code: Transaction.DateOutsideMonth
      }),
    categoryId: z.string().min(1, { message: 'finance:transactions.validation.category.required' }),
  })
}

export type TransactionFormValues = z.infer<ReturnType<typeof createTransactionSchema>>
