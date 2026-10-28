import { describe, expect, it } from 'vitest'
import type { AchievementDto } from '../types/AchievementDtos'
import { formatPlayingSince, unlockedTitles } from './playerProfile'

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
