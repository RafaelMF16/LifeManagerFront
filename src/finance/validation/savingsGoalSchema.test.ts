import { describe, expect, it } from 'vitest'
import { toSavingsGoalRequestDto } from '../services/savingsGoalService'
import { createSavingsGoalSchema } from './savingsGoalSchema'

const schema = createSavingsGoalSchema('2026-11')

const valid = {
  name: 'Viagem',
  targetAmount: '5.000,00',
  targetMonth: '2027-12',
  initialAmount: '',
  icon: 'plane',
}

function messagesFor(values: Record<string, string>, field: string) {
  const result = schema.safeParse(values)
  if (result.success) return []
  return result.error.issues.filter((issue) => issue.path[0] === field).map((issue) => issue.message)
}

describe('createSavingsGoalSchema', () => {
  it('accepts a goal with a deadline and nothing saved yet', () => {
    expect(schema.safeParse(valid).success).toBe(true)
  })

  it('accepts a goal without a deadline', () => {
    expect(schema.safeParse({ ...valid, targetMonth: '' }).success).toBe(true)
  })

  it('accepts the current month as the deadline', () => {
    expect(messagesFor({ ...valid, targetMonth: '2026-11' }, 'targetMonth')).toEqual([])
  })

  it('rejects a deadline before the current month', () => {
    expect(messagesFor({ ...valid, targetMonth: '2026-10' }, 'targetMonth')).toEqual([
      'finance:savingsGoals.validation.targetMonth.inPast',
    ])
  })

  it.each([
    ['', 'finance:savingsGoals.validation.name.required'],
    ['   ', 'finance:savingsGoals.validation.name.required'],
    ['a'.repeat(61), 'finance:savingsGoals.validation.name.tooLong'],
  ])('rejects the name %j', (name, message) => {
    expect(messagesFor({ ...valid, name }, 'name')).toEqual([message])
  })

  it('accepts a 60-character name', () => {
    expect(messagesFor({ ...valid, name: 'a'.repeat(60) }, 'name')).toEqual([])
  })

  it.each([
    ['', 'required'],
    ['0', 'notPositive'],
    ['abc', 'invalid'],
  ])('rejects the target %j', (targetAmount, key) => {
    expect(messagesFor({ ...valid, targetAmount }, 'targetAmount')).toEqual([`finance:savingsGoals.validation.targetAmount.${key}`])
  })

  it.each(['', '0', '0,00', '300,50'])('accepts the initial amount %j', (initialAmount) => {
    expect(messagesFor({ ...valid, initialAmount }, 'initialAmount')).toEqual([])
  })

  it('rejects an initial amount with too many decimals', () => {
    expect(messagesFor({ ...valid, initialAmount: '1,005' }, 'initialAmount')).toEqual([
      'finance:savingsGoals.validation.initialAmount.tooManyDecimals',
    ])
  })
})

describe('toSavingsGoalRequestDto', () => {
  it('sends numbers, a null deadline and zero for an empty initial amount', () => {
    expect(toSavingsGoalRequestDto({ ...valid, targetMonth: '', initialAmount: '' })).toEqual({
      name: 'Viagem',
      targetAmount: 5000,
      targetMonth: null,
      initialAmount: 0,
      icon: 'plane',
    })
  })

  it('reads a typed initial amount', () => {
    expect(toSavingsGoalRequestDto({ ...valid, initialAmount: '1.234,56' }).initialAmount).toBe(1234.56)
  })
})
