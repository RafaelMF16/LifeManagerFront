import { describe, expect, it } from 'vitest'
import { formatFrequency, weekDayLabels } from './formatFrequency'

function translate(key: string, options?: Record<string, unknown>) {
  return options ? `${key}:${JSON.stringify(options)}` : key
}

describe('weekDayLabels', () => {
  it('names the days Monday first in the given language, capitalized and without a trailing dot', () => {
    expect(weekDayLabels('en-US', 'short')).toEqual({
      Monday: 'Mon',
      Tuesday: 'Tue',
      Wednesday: 'Wed',
      Thursday: 'Thu',
      Friday: 'Fri',
      Saturday: 'Sat',
      Sunday: 'Sun',
    })
    expect(weekDayLabels('pt-BR', 'short').Monday).toBe('Seg')
    expect(weekDayLabels('pt-BR', 'long').Saturday).toBe('Sábado')
  })
})

describe('formatFrequency', () => {
  it('reads a daily habit as every day', () => {
    expect(formatFrequency({ frequencyType: 'Daily', weekDays: [], timesPerWeek: null }, translate, 'en-US')).toBe(
      'habits:habits.frequencySummary.daily',
    )
  })

  it('lists the picked days Monday first', () => {
    const habit = { frequencyType: 'WeekDays' as const, weekDays: ['Friday', 'Monday', 'Wednesday'] as const, timesPerWeek: null }

    expect(formatFrequency(habit, translate, 'en-US')).toBe('Mon, Wed, Fri')
  })

  it('reads every day of the week picked as every day', () => {
    const habit = {
      frequencyType: 'WeekDays' as const,
      weekDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const,
      timesPerWeek: null,
    }

    expect(formatFrequency(habit, translate, 'en-US')).toBe('habits:habits.frequencySummary.daily')
  })

  it('counts the times per week', () => {
    expect(formatFrequency({ frequencyType: 'TimesPerWeek', weekDays: [], timesPerWeek: 3 }, translate, 'en-US')).toBe(
      'habits:habits.frequencySummary.timesPerWeek:{"count":3}',
    )
  })
})
