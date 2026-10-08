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
    })
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

  it('always sends a habit to avoid as daily', () => {
    const dto = toRequestDto({ ...values, kind: 'Negative' })

    expect(dto).toMatchObject({ kind: 'Negative', frequencyType: 'Daily', weekDays: null, timesPerWeek: null })
  })
})

describe('toUpdateRequestDto', () => {
  it('leaves the kind out, since it never changes', () => {
    expect(toUpdateRequestDto(values)).not.toHaveProperty('kind')
  })
})
