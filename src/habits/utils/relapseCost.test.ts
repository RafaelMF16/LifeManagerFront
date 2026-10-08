import { describe, expect, it } from 'vitest'
import type { HabitAvoidItemDto } from '../types/HabitTodayDtos'
import { relapseCost } from './relapseCost'

function translate(key: string, options?: Record<string, unknown>) {
  return options ? `${key}:${JSON.stringify(options)}` : key
}

const daily: HabitAvoidItemDto = {
  id: 1,
  name: 'Video games',
  trigger: null,
  difficulty: 'Medium',
  frequencyType: 'Daily',
  timesPerWeek: null,
  currentStreak: 4,
  longestStreak: 9,
  relapsedToday: false,
  relapsedYesterday: false,
  canRelapseYesterday: true,
  weekRelapseCount: null,
  damagePreview: 8,
}

describe('relapseCost', () => {
  it('warns about the HP and the streak about to be lost', () => {
    expect(relapseCost(daily, translate)).toBe('habits:today.relapse.costWithStreak:{"hp":8,"count":4}')
  })

  it('only mentions the HP when there is no streak to lose', () => {
    expect(relapseCost({ ...daily, currentStreak: 0 }, translate)).toBe('habits:today.relapse.cost:{"hp":8,"count":0}')
  })

  it('says how much of a weekly limit is left after this one', () => {
    const weekly = { ...daily, frequencyType: 'TimesPerWeek' as const, timesPerWeek: 3, weekRelapseCount: 1, damagePreview: 0 }

    expect(relapseCost(weekly, translate)).toBe('habits:today.relapse.withinLimit:{"count":1}')
  })

  it('warns about the HP once a weekly limit is used up', () => {
    const weekly = { ...daily, frequencyType: 'TimesPerWeek' as const, timesPerWeek: 2, weekRelapseCount: 2, damagePreview: 8 }

    expect(relapseCost(weekly, translate)).toBe('habits:today.relapse.costWithStreak:{"hp":8,"count":4}')
  })
})
