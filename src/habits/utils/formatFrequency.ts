import type { HabitFrequencyType, HabitKind, WeekDay } from '../types/HabitDtos'
import { WEEK_DAYS } from '../types/HabitDtos'

// 2024-01-01 was a Monday: WEEK_DAYS[i] falls on January (1 + i).
const FIRST_MONDAY = Date.UTC(2024, 0, 1)
const DAY_MS = 24 * 60 * 60 * 1000

/** Day names in `locale`, Monday first, keyed by `WEEK_DAYS`; `short` reads "Mon"/"seg.", `long` "Monday"/"segunda-feira". */
export function weekDayLabels(locale: string, width: 'short' | 'long'): Record<WeekDay, string> {
  const format = new Intl.DateTimeFormat(locale, { weekday: width, timeZone: 'UTC' })
  const entries = WEEK_DAYS.map((day, index) => {
    const label = format.format(new Date(FIRST_MONDAY + index * DAY_MS)).replace(/\.$/, '')
    return [day, label.charAt(0).toLocaleUpperCase(locale) + label.slice(1)]
  })
  return Object.fromEntries(entries) as Record<WeekDay, string>
}

interface FrequencyLike {
  /** Omitted reads as `Positive`. */
  kind?: HabitKind
  frequencyType: HabitFrequencyType
  weekDays: readonly WeekDay[]
  timesPerWeek: number | null
}

/**
 * One line describing how often a habit is due: "Every day", "Mon, Wed, Fri" or "3× a week" ("Up to 2× a week" for a
 * habit to avoid, whose number is a limit). Every day of the week picked reads as "every day", and the days always
 * come Monday first.
 */
export function formatFrequency(habit: FrequencyLike, translate: (key: string, options?: Record<string, unknown>) => string, locale: string) {
  if (habit.frequencyType === 'TimesPerWeek') {
    const key = habit.kind === 'Negative' ? 'habits:habits.frequencySummary.limitPerWeek' : 'habits:habits.frequencySummary.timesPerWeek'
    return translate(key, { count: habit.timesPerWeek ?? 0 })
  }

  if (habit.frequencyType === 'WeekDays' && habit.weekDays.length < WEEK_DAYS.length) {
    const labels = weekDayLabels(locale, 'short')
    return WEEK_DAYS.filter((day) => habit.weekDays.includes(day))
      .map((day) => labels[day])
      .join(', ')
  }

  return translate('habits:habits.frequencySummary.daily')
}
