import { describe, expect, it } from 'vitest'
import { savingsGoalActionMessage, savingsGoalErrorFieldMap } from './savingsGoalErrorMap'

describe('savingsGoalErrorFieldMap', () => {
  it.each([
    ['SavingsGoal.NameIsNullOrWhiteSpace', 'name'],
    ['SavingsGoal.NameTooLong', 'name'],
    ['SavingsGoal.NameAlreadyExists', 'name'],
    ['SavingsGoal.InvalidTargetAmount', 'targetAmount'],
    ['SavingsGoal.InvalidInitialAmount', 'initialAmount'],
    ['SavingsGoal.InvalidTargetMonth', 'targetMonth'],
    ['SavingsGoal.TargetMonthInPast', 'targetMonth'],
    ['SavingsGoal.IconTooLong', 'icon'],
  ])('puts %s on the %s field', (code, field) => {
    expect(savingsGoalErrorFieldMap[code]?.field).toBe(field)
  })

  it('leaves the archived refusal to the form-level message', () => {
    expect(savingsGoalErrorFieldMap['SavingsGoal.Archived']).toBeUndefined()
  })
})

describe('savingsGoalActionMessage', () => {
  it.each([
    ['SavingsGoal.NotFound', 'finance:savingsGoals.errors.notFound'],
    ['SavingsGoal.NameAlreadyExists', 'finance:savingsGoals.errors.restoreNameTaken'],
    ['SavingsGoal.AlreadyArchived', 'finance:savingsGoals.errors.changedElsewhere'],
    ['SavingsGoal.NotArchived', 'finance:savingsGoals.errors.changedElsewhere'],
    ['Something.Else', 'common:errors.generic'],
  ])('shows %s as %s', (code, key) => {
    expect(savingsGoalActionMessage(code)).toBe(key)
  })
})
