import { describe, expect, it } from 'vitest'
import { budgetSchema } from './budgetSchema'

const valid = { type: 'Expense', categoryId: '3', amount: '1.200,00', from: '2026-10' }

function messagesFor(values: Record<string, string>, field: string) {
  const result = budgetSchema.safeParse(values)
  if (result.success) return []
  return result.error.issues.filter((issue) => issue.path[0] === field).map((issue) => issue.message)
}

describe('budgetSchema', () => {
  it('accepts a category goal and a month-total goal', () => {
    expect(budgetSchema.safeParse(valid).success).toBe(true)
    expect(budgetSchema.safeParse({ ...valid, type: 'Investment', categoryId: '' }).success).toBe(true)
  })

  it('rejects income, which has no goals', () => {
    expect(messagesFor({ ...valid, type: 'Income' }, 'type')).toEqual(['finance:budgets.validation.type.invalid'])
  })

  it.each(['', '2026-13', 'outubro'])('rejects the month %j', (from) => {
    expect(messagesFor({ ...valid, from }, 'from')).toEqual(['finance:budgets.validation.from.invalid'])
  })

  it('uses its own amount messages', () => {
    expect(messagesFor({ ...valid, amount: '' }, 'amount')).toEqual(['finance:budgets.validation.amount.required'])
  })
})
