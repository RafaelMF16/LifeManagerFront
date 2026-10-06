import { z } from 'zod'

// Espelha TransactionAmount.Create e BudgetAmount.Create (LifeManager.Domain): positive, at most 2 decimals,
// fits numeric(14, 2). Every money field of the Finance forms is typed as text and read by `parseAmount`.
export const AMOUNT_MAX_DECIMALS = 2
export const AMOUNT_MAX_VALUE = 999_999_999_999.99

const AMOUNT_PATTERN = /^\d+(\.\d+)?$/

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

/** A stored amount as the form shows it to be edited: "1234,56" in pt-BR, no grouping. */
export function toFormAmount(amount: number, language: string) {
  return new Intl.NumberFormat(language, { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }).format(amount)
}

/**
 * A money text field. `messages` is the translation-key prefix of the form's amount messages
 * (`.required`, `.invalid`, `.notPositive`, `.tooManyDecimals`, `.tooLarge`).
 */
export function amountField(messages: string) {
  return z
    .string()
    .trim()
    .superRefine((value, context) => {
      const fail = (key: string) => context.addIssue({ code: 'custom', message: `${messages}.${key}` })
      if (value === '') return fail('required')

      const amount = parseAmount(value)
      if (amount === null) return fail('invalid')
      if (amount <= 0) return fail('notPositive')
      if (decimalPlaces(value) > AMOUNT_MAX_DECIMALS) return fail('tooManyDecimals')
      if (amount > AMOUNT_MAX_VALUE) return fail('tooLarge')
    })
}
