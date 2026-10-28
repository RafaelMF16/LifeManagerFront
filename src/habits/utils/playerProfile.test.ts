import { describe, expect, it } from 'vitest'
import type { AchievementDto } from '../types/AchievementDtos'
import type { EvolutionPointDto } from '../types/PlayerProfileDtos'
import {
  formatPlayingSince,
  isEmptyEvolution,
  nearestPointIndex,
  periodSummary,
  showcase,
  unlockedTitles,
  weeklyPoints,
} from './playerProfile'

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

function days(count: number, value = (index: number) => index): EvolutionPointDto[] {
  return Array.from({ length: count }, (_, index) => ({
    date: new Date(Date.UTC(2026, 9, 1 + index)).toISOString().slice(0, 10),
    totalXp: value(index) * 10,
    coins: value(index),
  }))
}

describe('periodSummary', () => {
  it('gives the start, the end and the change of the series asked for', () => {
    const points = [
      { date: '2026-10-01', totalXp: 400, coins: 120 },
      { date: '2026-10-02', totalXp: 450, coins: 90 },
    ]

    expect(periodSummary(points, 'xp')).toEqual({ start: 400, end: 450, change: 50 })
    expect(periodSummary(points, 'coins')).toEqual({ start: 120, end: 90, change: -30 })
  })

  it('is all zero without points', () => {
    expect(periodSummary([], 'xp')).toEqual({ start: 0, end: 0, change: 0 })
  })
})

describe('isEmptyEvolution', () => {
  it('tells a new player apart from one who played', () => {
    expect(isEmptyEvolution(days(30, () => 0))).toBe(true)
    expect(isEmptyEvolution(days(30))).toBe(false)
  })
})

describe('weeklyPoints', () => {
  it('keeps today and every seventh day before it, plus the first day', () => {
    const points = days(30)
    const weekly = weeklyPoints(points)

    expect(weekly.map((point) => point.date)).toEqual(['2026-10-01', '2026-10-02', '2026-10-09', '2026-10-16', '2026-10-23', '2026-10-30'])
  })

  it('does not repeat the first day when it is already a week step', () => {
    expect(weeklyPoints(days(15)).map((point) => point.date)).toEqual(['2026-10-01', '2026-10-08', '2026-10-15'])
  })
})

describe('nearestPointIndex', () => {
  it('snaps the pointer to the closest day', () => {
    expect(nearestPointIndex(0, 600, 30)).toBe(0)
    expect(nearestPointIndex(600, 600, 30)).toBe(29)
    expect(nearestPointIndex(305, 600, 30)).toBe(15)
  })

  it('stays inside the plot', () => {
    expect(nearestPointIndex(-20, 600, 30)).toBe(0)
    expect(nearestPointIndex(900, 600, 30)).toBe(29)
    expect(nearestPointIndex(10, 0, 30)).toBe(0)
  })
})
