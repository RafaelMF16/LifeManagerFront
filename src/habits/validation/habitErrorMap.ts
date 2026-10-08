import type { ApiErrorFieldMap } from '../../shared/utils/applyApiErrorToForm'
import type { HabitFormValues } from './habitSchema'

// Espelha os códigos de LifeManager.Domain/Habits/Errors/HabitErrors.cs
export const HABIT_NOT_FOUND_CODE = 'Habit.NotFound'
export const HABIT_NAME_ALREADY_EXISTS_CODE = 'Habit.NameAlreadyExists'
export const HABIT_ARCHIVED_CODE = 'Habit.Archived'
export const HABIT_ALREADY_CHECKED_IN_CODE = 'Habit.AlreadyCheckedIn'
export const HABIT_CHECK_IN_NOT_FOUND_CODE = 'Habit.CheckInNotFound'
export const HABIT_CHECK_IN_OUTSIDE_WINDOW_CODE = 'Habit.CheckInOutsideWindow'

export const habitErrorFieldMap: ApiErrorFieldMap<HabitFormValues> = {
  'Habit.NameIsNullOrWhiteSpace': { field: 'name', message: 'habits:habits.validation.name.required' },
  'Habit.NameTooLong': { field: 'name', message: 'habits:habits.validation.name.tooLong' },
  [HABIT_NAME_ALREADY_EXISTS_CODE]: { field: 'name', message: 'habits:habits.validation.name.taken' },
  'Habit.DescriptionTooLong': { field: 'description', message: 'habits:habits.validation.description.tooLong' },
  'Habit.TriggerTooLong': { field: 'trigger', message: 'habits:habits.validation.trigger.tooLong' },
  'Habit.InvalidKind': { field: 'kind', message: 'habits:habits.validation.kind.invalid' },
  'Habit.InvalidDifficulty': { field: 'difficulty', message: 'habits:habits.validation.difficulty.invalid' },
  'Habit.InvalidFrequencyType': { field: 'frequencyType', message: 'habits:habits.validation.frequency.invalid' },
  'Habit.InvalidFrequencyCombination': { field: 'frequencyType', message: 'habits:habits.validation.frequency.invalid' },
  'Habit.WeekDaysRequired': { field: 'weekDays', message: 'habits:habits.validation.weekDays.required' },
  'Habit.InvalidTimesPerWeek': { field: 'timesPerWeek', message: 'habits:habits.validation.timesPerWeek.invalid' },
}
