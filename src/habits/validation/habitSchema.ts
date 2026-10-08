import { z } from 'zod'
import { WEEK_DAYS } from '../types/HabitDtos'

// Espelha LifeManager.Domain/Habits/ValueObjects (HabitName, HabitDescription, HabitTrigger, HabitFrequency).
export const HABIT_NAME_MAX_LENGTH = 60
export const HABIT_DESCRIPTION_MAX_LENGTH = 200
export const HABIT_TRIGGER_MAX_LENGTH = 120
export const HABIT_MIN_TIMES_PER_WEEK = 1
/** Seven times a week is a daily habit. */
export const HABIT_MAX_TIMES_PER_WEEK = 6

const TIMES_PATTERN = /^\d{1,2}$/

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
  })
  .superRefine((values, context) => {
    // A habit to avoid counts every day without a relapse: the form hides the frequency and sends Daily.
    if (values.kind === 'Negative') return

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
  })

export type HabitFormValues = z.infer<typeof habitSchema>
