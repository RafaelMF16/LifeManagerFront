import { describe, expect, it } from 'vitest'
import type { AchievementDto } from '../types/AchievementDtos'
import { formatPlayingSince, showcase, unlockedTitles } from './playerProfile'

function achievement(overrides: Partial<AchievementDto>): AchievementDto {
  return {
    code: 'CheckIns10',
    family: 'CheckIns',
    tier: 'Bronze',
    threshold: 10,
    progress: 0,
    coinsBonus: 25,
    xpBonus: 50,
    unlockedAt: null,
    ...overrides,
  }
}

describe('unlockedTitles', () => {
  it('lists the unlocked achievements in catalog order', () => {
    const achievements = [
      achievement({ code: 'CheckIns10', unlockedAt: '2026-10-28T12:00:00Z' }),
      achievement({ code: 'CheckIns100' }),
      achievement({ code: 'Streak7', family: 'Streak', unlockedAt: '2026-10-01T12:00:00Z' }),
    ]

    expect(unlockedTitles(achievements)).toEqual(['CheckIns10', 'Streak7'])
  })

  it('is empty before any unlock', () => {
    expect(unlockedTitles([achievement({})])).toEqual([])
  })
})

describe('formatPlayingSince', () => {
  it('names the month and the year in the UI language, without shifting the day', () => {
    expect(formatPlayingSince('2026-10-01', 'pt-BR')).toBe('outubro de 2026')
    expect(formatPlayingSince('2026-10-01', 'en-US')).toBe('October 2026')
  })
})

describe('showcase', () => {
  it('shows gold first, then silver, then bronze, the latest first inside a tier', () => {
    const achievements = [
      achievement({ code: 'CheckIns10', tier: 'Bronze', unlockedAt: '2026-10-01T12:00:00Z' }),
      achievement({ code: 'CheckIns100', tier: 'Silver', unlockedAt: '2026-10-02T12:00:00Z' }),
      achievement({ code: 'Streak7', tier: 'Bronze', unlockedAt: '2026-10-05T12:00:00Z' }),
      achievement({ code: 'AutomaticHabit', tier: 'Gold', unlockedAt: '2026-09-01T12:00:00Z' }),
      achievement({ code: 'Level5', tier: 'Bronze' }),
    ]

    expect(showcase(achievements).map((item) => item.code)).toEqual(['AutomaticHabit', 'CheckIns100', 'Streak7', 'CheckIns10'])
  })

  it('holds at most six', () => {
    const codes = ['CheckIns10', 'Streak7', 'Level5', 'Redemptions1', 'CleanDays10', 'CheckIns100', 'Streak30'] as const
    const achievements = codes.map((code, day) => achievement({ code, unlockedAt: `2026-10-0${day + 1}T12:00:00Z` }))

    expect(showcase(achievements)).toHaveLength(6)
    expect(showcase(achievements).map((item) => item.code)).not.toContain('CheckIns10')
  })

  it('is empty before any unlock', () => {
    expect(showcase([achievement({})])).toEqual([])
  })
})
