import { describe, expect, it } from 'vitest'
import { createTransactionSchema, monthDateRange, parseAmount } from './transactionSchema'

const schema = createTransactionSchema(2026, 3)

const valid = {
  type: 'Expense',
  description: 'Supermercado',
  amount: '120,50',
  date: '2026-03-07',
  categoryId: '4',
}

function messagesFor(values: Record<string, string>, field: string) {
  const result = schema.safeParse(values)
  if (result.success) return []
  return result.error.issues.filter((issue) => issue.path[0] === field).map((issue) => issue.message)
}

describe('parseAmount', () => {
  it.each([
    ['1234,56', 1234.56],
    ['1.234,56', 1234.56],
    ['1234.56', 1234.56],
    [' 10 ', 10],
    ['0,5', 0.5],
  ])('reads %s as %d', (input, expected) => {
    expect(parseAmount(input)).toBe(expected)
  })

  it.each(['', 'abc', '1,2,3', '-5', '12a'])('rejects %j', (input) => {
    expect(parseAmount(input)).toBeNull()
  })
})

describe('monthDateRange', () => {
  it('covers the whole month, leap years included', () => {
    expect(monthDateRange(2028, 2)).toEqual({ min: '2028-02-01', max: '2028-02-29' })
    expect(monthDateRange(2026, 12)).toEqual({ min: '2026-12-01', max: '2026-12-31' })
  })
})

describe('createTransactionSchema', () => {
  it('accepts a valid transaction and trims the description', () => {
    const result = schema.safeParse({ ...valid, description: '  Supermercado  ' })

    expect(result.success).toBe(true)
    expect(result.data?.description).toBe('Supermercado')
  })

  it.each([
    ['', 'finance:transactions.validation.amount.required'],
    ['abc', 'finance:transactions.validation.amount.invalid'],
    ['0', 'finance:transactions.validation.amount.notPositive'],
    ['0,00', 'finance:transactions.validation.amount.notPositive'],
    ['10,555', 'finance:transactions.validation.amount.tooManyDecimals'],
    ['1000000000000', 'finance:transactions.validation.amount.tooLarge'],
  ])('rejects the amount %j', (amount, message) => {
    expect(messagesFor({ ...valid, amount }, 'amount')).toEqual([message])
  })

  it.each(['2026-02-28', '2026-04-01', '2025-03-10', 'not-a-date'])('rejects the date %s outside the month', (date) => {
    expect(messagesFor({ ...valid, date }, 'date')).toEqual(['finance:transactions.validation.date.outsideMonth'])
  })

  it.each(['2026-03-01', '2026-03-31'])('accepts the edge day %s', (date) => {
    expect(messagesFor({ ...valid, date }, 'date')).toEqual([])
  })

  it('requires a category', () => {
    expect(messagesFor({ ...valid, categoryId: '' }, 'categoryId')).toEqual(['finance:transactions.validation.category.required'])
  })

  it('requires a description of at most 80 characters', () => {
    expect(messagesFor({ ...valid, description: '   ' }, 'description')).toEqual([
      'finance:transactions.validation.description.required',
    ])
    expect(messagesFor({ ...valid, description: 'a'.repeat(81) }, 'description')).toEqual([
      'finance:transactions.validation.description.tooLong',
    ])
  })
})
