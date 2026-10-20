import { z } from 'zod'
import { amountField } from './amountSchema'
import { TRANSACTION_DESCRIPTION_MAX_LENGTH } from './transactionSchema'

// Espelha StatementImportRow.Edit (LifeManager.Domain): the rules of a transaction, but the date may be any day
// from 2000 to today, since the row isn't in a month yet. An empty category is allowed (filed later).
export const IMPORT_ROW_MIN_DATE = '2000-01-01'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/** `today` is the browser's `YYYY-MM-DD`, the upper bound of the date. */
export function createImportRowSchema(today: string) {
  return z.object({
    type: z.enum(['Expense', 'Income', 'Investment'], { message: 'finance:transactions.validation.type.invalid' }),
    description: z
      .string()
      .trim()
      .min(1, { message: 'finance:transactions.validation.description.required' })
      .max(TRANSACTION_DESCRIPTION_MAX_LENGTH, { message: 'finance:transactions.validation.description.tooLong' }),
    amount: amountField('finance:transactions.validation.amount'),
    date: z
      .string()
      .min(1, { message: 'finance:transactions.validation.date.required' })
      .refine((value) => DATE_PATTERN.test(value) && value >= IMPORT_ROW_MIN_DATE && value <= today, {
        message: 'finance:imports.rowForm.validation.dateOutOfRange', // code: StatementImport.DateOutOfRange
      }),
    categoryId: z.string(),
    included: z.boolean(),
  })
}

export type ImportRowFormValues = z.infer<ReturnType<typeof createImportRowSchema>>
