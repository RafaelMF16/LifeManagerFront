import { describe, expect, it } from 'vitest'
import type { ChallengeHabitOptionDto } from '../types/ChallengeDtos'
import { createChallengeSchema } from './challengeSchema'

const habits: ChallengeHabitOptionDto[] = [
  { habitId: 1, name: 'Ler', unit: null, maxFrequency: 6, maxVolume: null, frequencyProgress: 2, volumeProgress: 0 },
  { habitId: 2, name: 'Água', unit: 'ml', maxFrequency: 7, maxVolume: 42_000, frequencyProgress: 0, volumeProgress: 1_000 },
]
const schema = createChallengeSchema(habits)

function messages(values: { habitId: string; type: 'Frequency' | 'Volume'; target: string }) {
  const result = schema.safeParse(values)
  return result.success ? [] : result.error.issues.map((issue) => issue.message)
}

describe('createChallengeSchema', () => {
  it('takes a target inside the week’s limits', () => {
    expect(messages({ habitId: '1', type: 'Frequency', target: '5' })).toEqual([])
    expect(messages({ habitId: '2', type: 'Volume', target: '10.000' })).toEqual([])
  })

  it('asks for a habit and a target', () => {
    expect(messages({ habitId: '', type: 'Frequency', target: '' })).toEqual([
      'habits:challenges.validation.habit.required',
      'habits:challenges.validation.target.required',
    ])
  })

  it('refuses a target out of range or already reached', () => {
    expect(messages({ habitId: '1', type: 'Frequency', target: '7' })).toEqual(['habits:challenges.validation.target.range'])
    expect(messages({ habitId: '1', type: 'Frequency', target: '2,5' })).toEqual(['habits:challenges.validation.target.range'])
    expect(messages({ habitId: '1', type: 'Frequency', target: '2' })).toEqual(['habits:challenges.validation.target.alreadyReached'])
    expect(messages({ habitId: '2', type: 'Volume', target: '42001' })).toEqual(['habits:challenges.validation.target.range'])
  })

  it('refuses volume for a habit without a daily target', () => {
    expect(messages({ habitId: '1', type: 'Volume', target: '10' })).toEqual(['habits:challenges.validation.type.notMeasurable'])
  })
})
