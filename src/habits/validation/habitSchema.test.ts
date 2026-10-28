import { describe, expect, it } from 'vitest'
import {
  HABIT_DESCRIPTION_MAX_LENGTH,
  HABIT_NAME_MAX_LENGTH,
  HABIT_TARGET_MAX_VALUE,
  HABIT_TARGET_UNIT_MAX_LENGTH,
  HABIT_TRIGGER_MAX_LENGTH,
  habitSchema,
} from './habitSchema'

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

  it('checks the days and the weekly limit of a habit to avoid like any other', () => {
    const negative = { ...valid, kind: 'Negative' }

    expect(messagesFor({ ...negative, frequencyType: 'WeekDays' }, 'weekDays')).toEqual(['habits:habits.validation.weekDays.required'])
    expect(messagesFor({ ...negative, frequencyType: 'TimesPerWeek', timesPerWeek: '7' }, 'timesPerWeek')).toEqual([
      'habits:habits.validation.timesPerWeek.invalid',
    ])
    expect(habitSchema.safeParse({ ...negative, frequencyType: 'WeekDays', weekDays: ['Monday', 'Friday'] }).success).toBe(true)
    expect(habitSchema.safeParse({ ...negative, frequencyType: 'TimesPerWeek', timesPerWeek: '2' }).success).toBe(true)
  })

  describe('daily target', () => {
    const measured = { ...valid, measured: true, targetValue: '2000', targetUnit: ' ml ', targetStep: '250' }

    it('defaults to no target when the fields are left out', () => {
      const result = habitSchema.safeParse(valid)

      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({ measured: false, targetValue: '', targetUnit: '', targetStep: '' })
    })

    it('accepts a valid target and trims the unit', () => {
      const result = habitSchema.safeParse(measured)

      expect(result.success).toBe(true)
      expect(result.data?.targetUnit).toBe('ml')
    })

    it('accepts a target without a step', () => {
      expect(habitSchema.safeParse({ ...measured, targetStep: '' }).success).toBe(true)
    })

    it.each(['', '0', String(HABIT_TARGET_MAX_VALUE + 1), '2.5', 'abc'])('rejects the target %j', (targetValue) => {
      expect(messagesFor({ ...measured, targetValue, targetStep: '' }, 'targetValue')).toEqual(['habits:habits.validation.target.value'])
    })

    it('rejects a missing or too long unit', () => {
      expect(messagesFor({ ...measured, targetUnit: '  ' }, 'targetUnit')).toEqual(['habits:habits.validation.target.unitRequired'])
      expect(messagesFor({ ...measured, targetUnit: 'a'.repeat(HABIT_TARGET_UNIT_MAX_LENGTH + 1) }, 'targetUnit')).toEqual([
        'habits:habits.validation.target.unitTooLong',
      ])
    })

    it.each(['0', '2001', '1.5'])('rejects the step %j', (targetStep) => {
      expect(messagesFor({ ...measured, targetStep }, 'targetStep')).toEqual(['habits:habits.validation.target.step'])
    })

    it('ignores the target when it is switched off or the habit is to avoid', () => {
      const broken = { ...measured, targetValue: 'abc', targetUnit: '' }

      expect(habitSchema.safeParse({ ...broken, measured: false }).success).toBe(true)
      expect(habitSchema.safeParse({ ...broken, kind: 'Negative' }).success).toBe(true)
    })
  })
})
