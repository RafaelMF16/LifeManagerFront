import { describe, expect, it } from 'vitest'
import type { HabitFormValues } from '../validation/habitSchema'
import { toRequestDto, toUpdateRequestDto } from './habitService'

const values: HabitFormValues = {
  name: 'Academia',
  description: '',
  trigger: 'Depois do trabalho',
  kind: 'Positive',
  difficulty: 'Medium',
  frequencyType: 'WeekDays',
  weekDays: ['Monday', 'Thursday'],
  timesPerWeek: '3',
  measured: false,
  targetValue: '',
  targetUnit: '',
  targetStep: '',
}

describe('toRequestDto', () => {
  it('sends only the days for a WeekDays habit and blank texts as null', () => {
    expect(toRequestDto(values)).toEqual({
      name: 'Academia',
      description: null,
      trigger: 'Depois do trabalho',
      kind: 'Positive',
      difficulty: 'Medium',
      frequencyType: 'WeekDays',
      weekDays: ['Monday', 'Thursday'],
      timesPerWeek: null,
      targetValue: null,
      targetUnit: null,
      targetStep: null,
    })
  })

  it('sends the daily target of a measured habit, without a blank step', () => {
    const dto = toRequestDto({ ...values, measured: true, targetValue: '2000', targetUnit: 'ml', targetStep: '' })

    expect(dto).toMatchObject({ targetValue: 2000, targetUnit: 'ml', targetStep: null })
  })

  it('sends no target when measuring is off or the habit is to avoid', () => {
    const target = { measured: true, targetValue: '2000', targetUnit: 'ml', targetStep: '250' }

    expect(toRequestDto({ ...values, ...target, measured: false })).toMatchObject({ targetValue: null, targetUnit: null, targetStep: null })
    expect(toRequestDto({ ...values, ...target, kind: 'Negative' })).toMatchObject({ targetValue: null, targetUnit: null, targetStep: null })
  })

  it('sends only the number for a TimesPerWeek habit', () => {
    const dto = toRequestDto({ ...values, frequencyType: 'TimesPerWeek' })

    expect(dto.weekDays).toBeNull()
    expect(dto.timesPerWeek).toBe(3)
  })

  it('sends neither for a daily habit', () => {
    const dto = toRequestDto({ ...values, frequencyType: 'Daily' })

    expect(dto.weekDays).toBeNull()
    expect(dto.timesPerWeek).toBeNull()
  })

  it('sends the frequency chosen for a habit to avoid', () => {
    expect(toRequestDto({ ...values, kind: 'Negative' })).toMatchObject({
      kind: 'Negative',
      frequencyType: 'WeekDays',
      weekDays: ['Monday', 'Thursday'],
      timesPerWeek: null,
    })
    expect(toRequestDto({ ...values, kind: 'Negative', frequencyType: 'TimesPerWeek', timesPerWeek: '2' })).toMatchObject({
      frequencyType: 'TimesPerWeek',
      weekDays: null,
      timesPerWeek: 2,
    })
  })
})

describe('toUpdateRequestDto', () => {
  it('leaves the kind out, since it never changes', () => {
    expect(toUpdateRequestDto(values)).not.toHaveProperty('kind')
  })
})
