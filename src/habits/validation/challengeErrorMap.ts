import type { ApiErrorFieldMap } from '../../shared/utils/applyApiErrorToForm'
import type { ChallengeFormValues } from './challengeSchema'

// Espelha os códigos de LifeManager.Domain/Habits/Errors/ChallengeErrors.
export const CHALLENGE_NOT_FOUND_CODE = 'Challenge.NotFound'
export const CHALLENGE_NOT_ACTIVE_CODE = 'Challenge.NotActive'

export const challengeErrorFieldMap: ApiErrorFieldMap<ChallengeFormValues> = {
  'Challenge.InvalidTarget': { field: 'target', message: 'habits:challenges.validation.target.range' },
  'Challenge.TargetAlreadyReached': { field: 'target', message: 'habits:challenges.validation.target.alreadyReached' },
  'Challenge.NotMeasurable': { field: 'type', message: 'habits:challenges.validation.type.notMeasurable' },
  'Challenge.HabitNotEligible': { field: 'habitId', message: 'habits:challenges.validation.habit.notEligible' },
  'Challenge.AlreadyExists': { field: 'habitId', message: 'habits:challenges.validation.habit.alreadyExists' },
}

/**
 * The form-level message for a refusal caused by the week changing meanwhile (another tab, or Wednesday ending);
 * null for the field errors above and anything unexpected.
 */
export function challengeWeekErrorKey(code: string): string | null {
  switch (code) {
    case 'Challenge.WeekLimitReached':
      return 'habits:challenges.validation.weekLimit'
    case 'Challenge.CreationWindowClosed':
      return 'habits:challenges.validation.windowClosed'
    default:
      return null
  }
}
