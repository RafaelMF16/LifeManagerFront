import { describe, expect, it } from 'vitest'
import { habitSchema } from '../validation/habitSchema'
import { rewardSchema } from '../validation/rewardSchema'
import { HABIT_TEMPLATES, REWARD_TEMPLATES, habitTemplateValues, isHabitTemplateId, rewardTemplateValues } from './starterTemplates'

const translate = (key: string) => `[${key}]`

describe('habitTemplateValues', () => {
  it('fills an easy daily habit to build with its translated name and cue', () => {
    expect(habitTemplateValues('read', translate)).toEqual({
      name: '[habits:onboarding.habits.read.name]',
      trigger: '[habits:onboarding.habits.read.trigger]',
      kind: 'Positive',
      difficulty: 'Easy',
      frequencyType: 'Daily',
    })
  })

  it.each(HABIT_TEMPLATES.map((template) => template.id))('gives a valid form for "%s"', (id) => {
    const values = { description: '', weekDays: [], timesPerWeek: '3', ...habitTemplateValues(id, translate) }

    expect(habitSchema.safeParse(values).success).toBe(true)
  })
})

describe('rewardTemplateValues', () => {
  it.each(REWARD_TEMPLATES.map((template) => template.id))('gives a valid reward for "%s"', (id) => {
    expect(rewardSchema.safeParse(rewardTemplateValues(id, translate)).success).toBe(true)
  })

  it('carries the price and icon', () => {
    expect(rewardTemplateValues('coffee', translate)).toEqual({ name: '[habits:onboarding.rewards.coffee]', cost: '30', icon: 'coffee' })
  })
})

describe('isHabitTemplateId', () => {
  it('only accepts a known template, e.g. from router state', () => {
    expect(isHabitTemplateId('water')).toBe(true)
    expect(isHabitTemplateId('smoke')).toBe(false)
    expect(isHabitTemplateId(undefined)).toBe(false)
  })
})
