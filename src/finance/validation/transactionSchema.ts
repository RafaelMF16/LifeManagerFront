import { z } from 'zod'

// Espelha LifeManager.Domain/Transactions/ValueObjects (TransactionDescription.Create, TransactionAmount.Create)
// e a regra de data de Transaction.Create.
export const TRANSACTION_DESCRIPTION_MAX_LENGTH = 80
export const TRANSACTION_AMOUNT_MAX_DECIMALS = 2
export const TRANSACTION_AMOUNT_MAX_VALUE = 999_999_999_999.99

const AMOUNT_PATTERN = /^\d+(\.\d+)?$/
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

/**
 * Reads what the user typed as money: "1234,56", "1.234,56" and "1234.56" are all 1234.56.
 * With a comma present, dots are thousands separators. Returns null when it isn't a plain number.
 */
export function parseAmount(value: string): number | null {
  const compact = value.replace(/\s/g, '')
  const normalized = compact.includes(',') ? compact.replace(/\./g, '').replace(',', '.') : compact
  return AMOUNT_PATTERN.test(normalized) ? Number(normalized) : null
}

function decimalPlaces(value: string) {
  const compact = value.replace(/\s/g, '')
  const separator = compact.includes(',') ? ',' : '.'
  const index = compact.lastIndexOf(separator)
  return index === -1 ? 0 : compact.length - index - 1
}

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
    amount: z
      .string()
      .trim()
      .superRefine((value, context) => {
        const fail = (message: string) => context.addIssue({ code: 'custom', message })
        if (value === '') return fail('finance:transactions.validation.amount.required')

        const amount = parseAmount(value)
        if (amount === null) return fail('finance:transactions.validation.amount.invalid')
        if (amount <= 0) return fail('finance:transactions.validation.amount.notPositive') // code: Transaction.AmountNotPositive
        if (decimalPlaces(value) > TRANSACTION_AMOUNT_MAX_DECIMALS) {
          return fail('finance:transactions.validation.amount.tooManyDecimals') // code: Transaction.AmountTooManyDecimals
        }
        if (amount > TRANSACTION_AMOUNT_MAX_VALUE) return fail('finance:transactions.validation.amount.tooLarge') // code: Transaction.AmountTooLarge
      }),
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
