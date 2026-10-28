import { z } from 'zod'
import { WEEK_DAYS } from '../types/HabitDtos'

// Espelha LifeManager.Domain/Habits/ValueObjects (HabitName, HabitDescription, HabitTrigger, HabitFrequency, HabitTarget).
export const HABIT_NAME_MAX_LENGTH = 60
export const HABIT_DESCRIPTION_MAX_LENGTH = 200
export const HABIT_TRIGGER_MAX_LENGTH = 120
export const HABIT_MIN_TIMES_PER_WEEK = 1
/** Seven times a week is a daily habit. */
export const HABIT_MAX_TIMES_PER_WEEK = 6
export const HABIT_TARGET_MAX_VALUE = 100_000
export const HABIT_TARGET_UNIT_MAX_LENGTH = 15

const TIMES_PATTERN = /^\d{1,2}$/
const WHOLE_NUMBER_PATTERN = /^\d{1,6}$/

/** A whole number typed as text, between 1 and `max`; null otherwise. */
export function parseWholeNumber(value: string, max: number): number | null {
  if (!WHOLE_NUMBER_PATTERN.test(value)) return null
  const number = Number(value)
  return number >= 1 && number <= max ? number : null
}

export const habitSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { message: 'habits:habits.validation.name.required' }) // code: Habit.NameIsNullOrWhiteSpace
      .max(HABIT_NAME_MAX_LENGTH, { message: 'habits:habits.validation.name.tooLong' }), // code: Habit.NameTooLong
    description: z
      .string()
      .trim()
      .max(HABIT_DESCRIPTION_MAX_LENGTH, { message: 'habits:habits.validation.description.tooLong' }), // code: Habit.DescriptionTooLong
    trigger: z
      .string()
      .trim()
      .max(HABIT_TRIGGER_MAX_LENGTH, { message: 'habits:habits.validation.trigger.tooLong' }), // code: Habit.TriggerTooLong
    kind: z.enum(['Positive', 'Negative'], { message: 'habits:habits.validation.kind.invalid' }), // code: Habit.InvalidKind
    difficulty: z.enum(['Easy', 'Medium', 'Hard'], { message: 'habits:habits.validation.difficulty.invalid' }), // code: Habit.InvalidDifficulty
    frequencyType: z.enum(['Daily', 'WeekDays', 'TimesPerWeek'], { message: 'habits:habits.validation.frequency.invalid' }), // code: Habit.InvalidFrequencyType
    weekDays: z.array(z.enum(WEEK_DAYS)),
    /** Typed as text; only read when the frequency is `TimesPerWeek`. */
    timesPerWeek: z.string().trim(),
    /** "Measure an amount": the daily target below only applies with it on, and only to a habit to build. */
    measured: z.boolean().default(false),
    /** Typed as text, like `timesPerWeek`. */
    targetValue: z.string().trim().default(''),
    targetUnit: z.string().trim().default(''),
    /** Optional quick-add amount; blank for none. */
    targetStep: z.string().trim().default(''),
  })
  // The same rules for both kinds: for a habit to avoid, the days are the ones it is avoided on and the number is the
  // weekly limit.
  .superRefine((values, context) => {
    if (values.frequencyType === 'WeekDays' && values.weekDays.length === 0) {
      context.addIssue({
        code: 'custom',
        path: ['weekDays'],
        message: 'habits:habits.validation.weekDays.required', // code: Habit.WeekDaysRequired
      })
    }

    if (values.frequencyType === 'TimesPerWeek') {
      const times = Number(values.timesPerWeek)
      if (!TIMES_PATTERN.test(values.timesPerWeek) || times < HABIT_MIN_TIMES_PER_WEEK || times > HABIT_MAX_TIMES_PER_WEEK) {
        context.addIssue({
          code: 'custom',
          path: ['timesPerWeek'],
          message: 'habits:habits.validation.timesPerWeek.invalid', // code: Habit.InvalidTimesPerWeek
        })
      }
    }

    if (values.measured && values.kind === 'Positive') {
      const target = parseWholeNumber(values.targetValue, HABIT_TARGET_MAX_VALUE)
      if (target === null) {
        context.addIssue({
          code: 'custom',
          path: ['targetValue'],
          message: 'habits:habits.validation.target.value', // code: Habit.InvalidTargetValue
        })
      }

      if (values.targetUnit === '') {
        context.addIssue({
          code: 'custom',
          path: ['targetUnit'],
          message: 'habits:habits.validation.target.unitRequired', // code: Habit.TargetUnitRequired
        })
      } else if (values.targetUnit.length > HABIT_TARGET_UNIT_MAX_LENGTH) {
        context.addIssue({
          code: 'custom',
          path: ['targetUnit'],
          message: 'habits:habits.validation.target.unitTooLong', // code: Habit.TargetUnitTooLong
        })
      }

      if (values.targetStep !== '') {
        const step = parseWholeNumber(values.targetStep, target ?? HABIT_TARGET_MAX_VALUE)
        if (step === null) {
          context.addIssue({
            code: 'custom',
            path: ['targetStep'],
            message: 'habits:habits.validation.target.step', // code: Habit.InvalidTargetStep
          })
        }
      }
    }
  })

export type HabitFormValues = z.infer<typeof habitSchema>
