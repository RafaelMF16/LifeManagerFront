import type { ApiErrorFieldMap } from '../../shared/utils/applyApiErrorToForm'
import type { ImportRowFormValues } from './importRowSchema'

// Espelha os códigos de LifeManager.Domain/StatementImports/Errors/StatementImportErrors.cs
export const STATEMENT_IMPORT_NOT_FOUND_CODE = 'StatementImport.NotFound'
export const STATEMENT_IMPORT_ROW_NOT_FOUND_CODE = 'StatementImport.RowNotFound'
export const STATEMENT_IMPORT_ALREADY_COMMITTED_CODE = 'StatementImport.AlreadyCommitted'
export const STATEMENT_IMPORT_UNCATEGORIZED_ROWS_CODE = 'StatementImport.UncategorizedRows'
export const STATEMENT_IMPORT_NOTHING_TO_IMPORT_CODE = 'StatementImport.NothingToImport'

/**
 * Codes that end the review (the draft is gone or was confirmed elsewhere): the page reloads instead of
 * showing the error on a row.
 */
export const STATEMENT_IMPORT_GONE_CODES = [STATEMENT_IMPORT_NOT_FOUND_CODE, STATEMENT_IMPORT_ALREADY_COMMITTED_CODE]

/** The row form's fields; the messages are the transaction form's, since a row has a transaction's rules. */
export const importRowErrorFieldMap: ApiErrorFieldMap<ImportRowFormValues> = {
  'Transaction.InvalidType': { field: 'type', message: 'finance:transactions.validation.type.invalid' },
  'Transaction.DescriptionIsNullOrWhiteSpace': { field: 'description', message: 'finance:transactions.validation.description.required' },
  'Transaction.DescriptionTooLong': { field: 'description', message: 'finance:transactions.validation.description.tooLong' },
  'Transaction.AmountNotPositive': { field: 'amount', message: 'finance:transactions.validation.amount.notPositive' },
  'Transaction.AmountTooManyDecimals': { field: 'amount', message: 'finance:transactions.validation.amount.tooManyDecimals' },
  'Transaction.AmountTooLarge': { field: 'amount', message: 'finance:transactions.validation.amount.tooLarge' },
  'StatementImport.DateOutOfRange': { field: 'date', message: 'finance:imports.rowForm.validation.dateOutOfRange' },
  'Category.NotFound': { field: 'categoryId', message: 'finance:transactions.validation.category.notFound' },
}
