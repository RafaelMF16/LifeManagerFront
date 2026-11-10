import { describe, expect, it } from 'vitest'
import { createMonthlySummarySchema, monthlySummaryYears } from './monthlySummarySchema'

const schema = createMonthlySummarySchema(2027)

function messagesFor(values: Record<string, unknown>, field: string) {
  const result = schema.safeParse(values)
  if (result.success) return []
  return result.error.issues.filter((issue) => issue.path[0] === field).map((issue) => issue.message)
}

describe('monthlySummaryYears', () => {
  it('offers the current year first, then the previous one', () => {
    expect(monthlySummaryYears(2027)).toEqual([2027, 2026])
  })
})

describe('createMonthlySummarySchema', () => {
  it.each([2027, 2026])('accepts the year %i', (year) => {
    expect(schema.safeParse({ month: 12, year }).success).toBe(true)
  })

  it.each([2025, 2028])('rejects the year %i', (year) => {
    expect(messagesFor({ month: 1, year }, 'year')).toEqual(['finance:months.validation.year.notAllowed'])
  })

  it.each([0, 13])('rejects the month %i', (month) => {
    expect(messagesFor({ month, year: 2027 }, 'month')).toEqual(['finance:months.validation.month.invalid'])
  })
})
