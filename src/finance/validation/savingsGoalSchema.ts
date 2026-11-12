import { z } from 'zod'
import { parseYearMonth } from '../utils/yearMonth'
import { amountField } from './amountSchema'

// Espelha LifeManager.Domain/SavingsGoals (SavingsGoalName.Create e as regras de SavingsGoal.Create).
export const SAVINGS_GOAL_NAME_MAX_LENGTH = 60

/** `minTargetMonth` (`yyyy-MM`) is the current month: a deadline can't be before it, on create or edit. */
export function createSavingsGoalSchema(minTargetMonth: string) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, { message: 'finance:savingsGoals.validation.name.required' }) // code: SavingsGoal.NameIsNullOrWhiteSpace
      .max(SAVINGS_GOAL_NAME_MAX_LENGTH, { message: 'finance:savingsGoals.validation.name.tooLong' }), // code: SavingsGoal.NameTooLong
    // code: SavingsGoal.InvalidTargetAmount
    targetAmount: amountField('finance:savingsGoals.validation.targetAmount'),
    /** Empty means no deadline. */
    targetMonth: z
      .string()
      .refine((value) => value === '' || parseYearMonth(value) !== null, {
        message: 'finance:savingsGoals.validation.targetMonth.invalid', // code: SavingsGoal.InvalidTargetMonth
      })
      .refine((value) => value === '' || value >= minTargetMonth, {
        message: 'finance:savingsGoals.validation.targetMonth.inPast', // code: SavingsGoal.TargetMonthInPast
      }),
    // Empty is zero. code: SavingsGoal.InvalidInitialAmount
    initialAmount: amountField('finance:savingsGoals.validation.initialAmount', { optional: true, allowZero: true }),
    icon: z.string(),
  })
}

export type SavingsGoalFormValues = z.infer<ReturnType<typeof createSavingsGoalSchema>>
