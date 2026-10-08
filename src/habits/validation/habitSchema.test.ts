import { describe, expect, it } from 'vitest'
import { HABIT_DESCRIPTION_MAX_LENGTH, HABIT_NAME_MAX_LENGTH, HABIT_TRIGGER_MAX_LENGTH, habitSchema } from './habitSchema'

const valid = {
  name: 'Ler',
  description: '',
  trigger: '',
  kind: 'Positive',
  difficulty: 'Easy',
  frequencyType: 'Daily',
  weekDays: [] as string[],
  timesPerWeek: '',
}

function messagesFor(values: Record<string, unknown>, field: string) {
  const result = habitSchema.safeParse(values)
  if (result.success) return []
  return result.error.issues.filter((issue) => issue.path[0] === field).map((issue) => issue.message)
}

describe('habitSchema', () => {
  it('accepts a valid daily habit and trims the texts', () => {
    const result = habitSchema.safeParse({ ...valid, name: '  Ler  ', trigger: ' Depois do jantar ' })

    expect(result.success).toBe(true)
    expect(result.data?.name).toBe('Ler')
    expect(result.data?.trigger).toBe('Depois do jantar')
  })

  it.each([
    ['', 'habits:habits.validation.name.required'],
    ['   ', 'habits:habits.validation.name.required'],
    ['a'.repeat(HABIT_NAME_MAX_LENGTH + 1), 'habits:habits.validation.name.tooLong'],
  ])('rejects the name %j', (name, message) => {
    expect(messagesFor({ ...valid, name }, 'name')).toEqual([message])
  })

  it('accepts a name with exactly the maximum length', () => {
    expect(messagesFor({ ...valid, name: 'a'.repeat(HABIT_NAME_MAX_LENGTH) }, 'name')).toEqual([])
  })

  it('rejects a description or trigger longer than the maximum', () => {
    expect(messagesFor({ ...valid, description: 'a'.repeat(HABIT_DESCRIPTION_MAX_LENGTH + 1) }, 'description')).toEqual([
      'habits:habits.validation.description.tooLong',
    ])
    expect(messagesFor({ ...valid, trigger: 'a'.repeat(HABIT_TRIGGER_MAX_LENGTH + 1) }, 'trigger')).toEqual([
      'habits:habits.validation.trigger.tooLong',
    ])
  })

  it('rejects unknown kinds, difficulties and frequencies', () => {
    expect(messagesFor({ ...valid, kind: 'Neutral' }, 'kind')).toEqual(['habits:habits.validation.kind.invalid'])
    expect(messagesFor({ ...valid, difficulty: 'Epic' }, 'difficulty')).toEqual(['habits:habits.validation.difficulty.invalid'])
    expect(messagesFor({ ...valid, frequencyType: 'Monthly' }, 'frequencyType')).toEqual([
      'habits:habits.validation.frequency.invalid',
    ])
  })

  it('requires at least one day for a WeekDays habit', () => {
    const values = { ...valid, frequencyType: 'WeekDays' }

    expect(messagesFor(values, 'weekDays')).toEqual(['habits:habits.validation.weekDays.required'])
    expect(messagesFor({ ...values, weekDays: ['Monday', 'Friday'] }, 'weekDays')).toEqual([])
  })

  it('rejects an unknown day', () => {
    expect(messagesFor({ ...valid, frequencyType: 'WeekDays', weekDays: ['Funday'] }, 'weekDays')).not.toEqual([])
  })

  it.each(['1', '6', ' 3 '])('accepts %j times per week', (timesPerWeek) => {
    expect(messagesFor({ ...valid, frequencyType: 'TimesPerWeek', timesPerWeek }, 'timesPerWeek')).toEqual([])
  })

  it.each(['', '0', '7', '-1', '2.5', 'abc'])('rejects %j times per week', (timesPerWeek) => {
    expect(messagesFor({ ...valid, frequencyType: 'TimesPerWeek', timesPerWeek }, 'timesPerWeek')).toEqual([
      'habits:habits.validation.timesPerWeek.invalid',
    ])
  })

  it('ignores the fields of the frequencies not chosen', () => {
    expect(habitSchema.safeParse({ ...valid, frequencyType: 'Daily', timesPerWeek: 'abc' }).success).toBe(true)
    expect(habitSchema.safeParse({ ...valid, frequencyType: 'TimesPerWeek', timesPerWeek: '2', weekDays: [] }).success).toBe(true)
  })

  it('skips the frequency checks for a habit to avoid, which is always daily', () => {
    expect(habitSchema.safeParse({ ...valid, kind: 'Negative', frequencyType: 'WeekDays', weekDays: [] }).success).toBe(true)
  })
})
