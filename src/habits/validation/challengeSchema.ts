import { z } from 'zod'
import type { ChallengeHabitOptionDto } from '../types/ChallengeDtos'
import { parseWholeNumber } from '../utils/challenges'

/**
 * The challenge form for the week's `habits` (the backend's options carry each target's limits). The messages are
 * translation keys; the limits mirror LifeManager.Domain/Habits/Challenges/ChallengeRules and are checked again there.
 */
export function createChallengeSchema(habits: ChallengeHabitOptionDto[]) {
  return z
    .object({
      habitId: z.string().min(1, { message: 'habits:challenges.validation.habit.required' }),
      type: z.enum(['Frequency', 'Volume']),
      target: z.string().trim().min(1, { message: 'habits:challenges.validation.target.required' }),
    })
    .superRefine((values, context) => {
      const option = habits.find((habit) => String(habit.habitId) === values.habitId)
      if (!option) return

      if (values.type === 'Volume' && option.maxVolume === null) {
        context.addIssue({ code: 'custom', path: ['type'], message: 'habits:challenges.validation.type.notMeasurable' })
        return
      }

      const target = parseWholeNumber(values.target)
      const max = values.type === 'Volume' ? option.maxVolume! : option.maxFrequency
      const progress = values.type === 'Volume' ? option.volumeProgress : option.frequencyProgress

      if (target === null || target < 1 || target > max) {
        context.addIssue({ code: 'custom', path: ['target'], message: 'habits:challenges.validation.target.range' }) // code: Challenge.InvalidTarget
      } else if (target <= progress) {
        context.addIssue({ code: 'custom', path: ['target'], message: 'habits:challenges.validation.target.alreadyReached' }) // code: Challenge.TargetAlreadyReached
      }
    })
}

export type ChallengeFormValues = z.infer<ReturnType<typeof createChallengeSchema>>
