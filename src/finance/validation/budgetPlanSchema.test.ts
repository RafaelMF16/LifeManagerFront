import { describe, expect, it } from 'vitest'
import { budgetPlanSchema, readTotal } from './budgetPlanSchema'

function totalMessages(total: string) {
  const result = budgetPlanSchema.safeParse({ total })
  if (result.success) return []
  return result.error.issues.map((issue) => issue.message)
}

describe('budgetPlanSchema', () => {
  it('accepts a positive total typed either way', () => {
    expect(budgetPlanSchema.safeParse({ total: '6.000,00' }).success).toBe(true)
    expect(budgetPlanSchema.safeParse({ total: '6000.5' }).success).toBe(true)
  })

  it.each([
    ['', 'required'],
    ['abc', 'invalid'],
    ['0', 'notPositive'],
    ['10,123', 'tooManyDecimals'],
    ['1000000000000', 'tooLarge'],
  ])('rejects %j with its own message', (total, key) => {
    expect(totalMessages(total)).toEqual([`finance:budgetPlan.validation.total.${key}`])
  })
})

describe('readTotal', () => {
  it('reads a valid total', () => {
    expect(readTotal('6.000,50')).toBe(6000.5)
  })

  it('is null for anything the schema rejects', () => {
    expect(readTotal('')).toBeNull()
    expect(readTotal('0')).toBeNull()
    expect(readTotal('10,123')).toBeNull()
    expect(readTotal('abc')).toBeNull()
  })
})
