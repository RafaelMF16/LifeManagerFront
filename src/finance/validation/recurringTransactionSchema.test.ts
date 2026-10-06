import { describe, expect, it } from 'vitest'
import { createRecurringTransactionSchema } from './recurringTransactionSchema'

const schema = createRecurringTransactionSchema('2026-10')

const valid = {
  type: 'Income',
  description: 'Salário',
  amount: '8.000,00',
  dayOfMonth: '5',
  categoryId: '2',
  startMonth: '2026-10',
  endMonth: '',
}

function messagesFor(values: Record<string, string>, field: string) {
  const result = schema.safeParse(values)
  if (result.success) return []
  return result.error.issues.filter((issue) => issue.path[0] === field).map((issue) => issue.message)
}

describe('createRecurringTransactionSchema', () => {
  it('accepts a recurrence with no end', () => {
    expect(schema.safeParse(valid).success).toBe(true)
  })

  it('accepts an end month after the start', () => {
    expect(schema.safeParse({ ...valid, endMonth: '2027-06' }).success).toBe(true)
  })

  it.each(['0', '32', 'abc', '', '1.5'])('rejects the day %j', (dayOfMonth) => {
    expect(messagesFor({ ...valid, dayOfMonth }, 'dayOfMonth')).toEqual(['finance:recurring.validation.day.invalid'])
  })

  it.each(['1', '31'])('accepts the day %s', (dayOfMonth) => {
    expect(messagesFor({ ...valid, dayOfMonth }, 'dayOfMonth')).toEqual([])
  })

  it('rejects a start before the earliest month allowed', () => {
    expect(messagesFor({ ...valid, startMonth: '2026-09' }, 'startMonth')).toEqual(['finance:recurring.validation.startMonth.inPast'])
  })

  it('accepts a past start when the form allows it (an edited recurrence)', () => {
    const editing = createRecurringTransactionSchema('2026-03')

    expect(editing.safeParse({ ...valid, startMonth: '2026-03' }).success).toBe(true)
  })

  it('rejects an end before the start', () => {
    expect(messagesFor({ ...valid, endMonth: '2026-09' }, 'endMonth')).toEqual(['finance:recurring.validation.endMonth.beforeStart'])
  })

  it('requires a category', () => {
    expect(messagesFor({ ...valid, categoryId: '' }, 'categoryId')).toEqual(['finance:recurring.validation.category.required'])
  })

  it('uses its own amount messages', () => {
    expect(messagesFor({ ...valid, amount: '0' }, 'amount')).toEqual(['finance:recurring.validation.amount.notPositive'])
  })
})
