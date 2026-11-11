import { z } from 'zod'

// Espelha TransactionAmount.Create e BudgetTotal.Create (LifeManager.Domain): positive, at most 2 decimals,
// fits numeric(14, 2). Every money field of the Finance forms is typed as text and read by `parseAmount`.
export const AMOUNT_MAX_DECIMALS = 2
export const AMOUNT_MAX_VALUE = 999_999_999_999.99
/** Digits of AMOUNT_MAX_VALUE, cents included: the most a money field takes while typing. */
export const AMOUNT_MAX_DIGITS = 14

const AMOUNT_PATTERN = /^\d+(\.\d+)?$/

/**
 * The decimal separator of a typed amount: with both a comma and a dot, the last one ("1.234,56", "1,234.56"),
 * otherwise a comma when there is one. The other separator groups thousands.
 */
function decimalSeparator(compact: string) {
  return compact.lastIndexOf(',') > compact.lastIndexOf('.') ? ',' : '.'
}

/**
 * Reads what the user typed as money: "1234,56", "1.234,56", "1,234.56" and "1234.56" are all 1234.56.
 * Returns null when it isn't a plain number.
 */
export function parseAmount(value: string): number | null {
  const compact = value.replace(/\s/g, '')
  const normalized = decimalSeparator(compact) === ',' ? compact.replace(/\./g, '').replace(',', '.') : compact.replace(/,/g, '')
  return AMOUNT_PATTERN.test(normalized) ? Number(normalized) : null
}

function decimalPlaces(value: string) {
  const compact = value.replace(/\s/g, '')
  const index = compact.lastIndexOf(decimalSeparator(compact))
  return index === -1 ? 0 : compact.length - index - 1
}

/** A stored amount as the form shows it to be edited: "1.234,56" in pt-BR. */
export function toFormAmount(amount: number, language: string) {
  return new Intl.NumberFormat(language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
}

/**
 * What a money field shows while typing: digits fill from the right, cents first (Banco Inter style), so
 * "5" is "0,05" and "1234567" is "12.345,67". Erasing the last character drops the last digit. Only zeros → ""
 * (erasing everything ends on the placeholder, not stuck on "0,00"); digits past AMOUNT_MAX_DIGITS are ignored.
 */
export function formatAmountInput(value: string, language: string) {
  const digits = value.replace(/\D/g, '').replace(/^0+/, '').slice(0, AMOUNT_MAX_DIGITS)
  // At most 14 digits, so the division stays exact to the cent.
  return digits === '' ? '' : toFormAmount(Number(digits) / 100, language)
}

interface AmountFieldOptions {
  /** Empty is valid (the caller reads it as zero) instead of `.required`. */
  optional?: boolean
  /** Zero is valid (an amount already saved) instead of `.notPositive`. */
  allowZero?: boolean
}

/**
 * A money text field. `messages` is the translation-key prefix of the form's amount messages
 * (`.required`, `.invalid`, `.notPositive`, `.tooManyDecimals`, `.tooLarge`).
 */
export function amountField(messages: string, { optional = false, allowZero = false }: AmountFieldOptions = {}) {
  return z
    .string()
    .trim()
    .superRefine((value, context) => {
      const fail = (key: string) => context.addIssue({ code: 'custom', message: `${messages}.${key}` })
      if (value === '') return optional ? undefined : fail('required')

      const amount = parseAmount(value)
      if (amount === null) return fail('invalid')
      if (allowZero ? amount < 0 : amount <= 0) return fail('notPositive')
      if (decimalPlaces(value) > AMOUNT_MAX_DECIMALS) return fail('tooManyDecimals')
      if (amount > AMOUNT_MAX_VALUE) return fail('tooLarge')
    })
}
