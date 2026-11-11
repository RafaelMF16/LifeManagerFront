import type { ApiErrorFieldMap } from '../../shared/utils/applyApiErrorToForm'
import type { SavingsGoalFormValues } from './savingsGoalSchema'

// Espelha os códigos de LifeManager.Domain/SavingsGoals/Errors/SavingsGoalErrors.cs
export const SAVINGS_GOAL_NOT_FOUND_CODE = 'SavingsGoal.NotFound'
export const SAVINGS_GOAL_ARCHIVED_CODE = 'SavingsGoal.Archived'
export const SAVINGS_GOAL_NAME_ALREADY_EXISTS_CODE = 'SavingsGoal.NameAlreadyExists'
export const SAVINGS_GOAL_ALREADY_ARCHIVED_CODE = 'SavingsGoal.AlreadyArchived'
export const SAVINGS_GOAL_NOT_ARCHIVED_CODE = 'SavingsGoal.NotArchived'

export const savingsGoalErrorFieldMap: ApiErrorFieldMap<SavingsGoalFormValues> = {
  'SavingsGoal.NameIsNullOrWhiteSpace': { field: 'name', message: 'finance:savingsGoals.validation.name.required' },
  'SavingsGoal.NameTooLong': { field: 'name', message: 'finance:savingsGoals.validation.name.tooLong' },
  [SAVINGS_GOAL_NAME_ALREADY_EXISTS_CODE]: { field: 'name', message: 'finance:savingsGoals.validation.name.alreadyExists' },
  'SavingsGoal.InvalidTargetAmount': { field: 'targetAmount', message: 'finance:savingsGoals.validation.targetAmount.invalidServer' },
  'SavingsGoal.InvalidInitialAmount': { field: 'initialAmount', message: 'finance:savingsGoals.validation.initialAmount.invalidServer' },
  'SavingsGoal.InvalidTargetMonth': { field: 'targetMonth', message: 'finance:savingsGoals.validation.targetMonth.invalid' },
  'SavingsGoal.TargetMonthInPast': { field: 'targetMonth', message: 'finance:savingsGoals.validation.targetMonth.inPast' },
  'SavingsGoal.IconTooLong': { field: 'icon', message: 'finance:savingsGoals.validation.icon.tooLong' },
}

/**
 * What a list action (archive, restore) shows for a refusal, as a translation key. Restoring a goal whose name an
 * active goal took meanwhile is the one the user can fix (rename one of them).
 */
export function savingsGoalActionMessage(code: string): string {
  switch (code) {
    case SAVINGS_GOAL_NOT_FOUND_CODE:
      return 'finance:savingsGoals.errors.notFound'
    case SAVINGS_GOAL_NAME_ALREADY_EXISTS_CODE:
      return 'finance:savingsGoals.errors.restoreNameTaken'
    case SAVINGS_GOAL_ALREADY_ARCHIVED_CODE:
    case SAVINGS_GOAL_NOT_ARCHIVED_CODE:
      return 'finance:savingsGoals.errors.changedElsewhere'
    default:
      return 'common:errors.generic'
  }
}
