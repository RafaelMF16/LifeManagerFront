import i18next from 'i18next'
import { describe, expect, it } from 'vitest'
import enUS from '../locales/en-US'
import ptBR from '../locales/pt-BR'
import type { AchievementDto } from '../types/AchievementDtos'
import {
  achievementBonus,
  achievementCriterion,
  achievementName,
  achievementPercent,
  achievementProgressLabel,
  achievementRemaining,
  achievementTitle,
  groupAchievementsByFamily,
  nearestAchievements,
} from './achievements'

const i18n = i18next.createInstance()
void i18n.init({
  resources: { 'en-US': { habits: enUS }, 'pt-BR': { habits: ptBR } },
  lng: 'pt-BR',
  ns: ['habits'],
  interpolation: { escapeValue: false },
})
const pt = i18n.getFixedT('pt-BR')
const en = i18n.getFixedT('en-US')

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

const checkIns10 = achievement({})
const checkIns100 = achievement({ code: 'CheckIns100', tier: 'Silver', threshold: 100, coinsBonus: 100, xpBonus: 150 })
const streak7 = achievement({ code: 'Streak7', family: 'Streak', threshold: 7 })
const level5 = achievement({ code: 'Level5', family: 'Level', threshold: 5, progress: 1 })
const comeback = achievement({ code: 'Comeback', family: 'Overcoming', tier: 'Silver', threshold: 10 })
const automatic = achievement({ code: 'AutomaticHabit', family: 'Overcoming', tier: 'Gold', threshold: 66 })

describe('achievement texts', () => {
  it('names the achievement and its title in both languages', () => {
    expect(achievementName('CheckIns100', pt)).toBe('Constância')
    expect(achievementName('CheckIns100', en)).toBe('Consistency')
    expect(achievementTitle('Comeback', pt)).toBe('Fênix')
    expect(achievementTitle('Comeback', en)).toBe('Phoenix')
  })

  it('says what it takes, by family or by code for the one-off feats', () => {
    expect(achievementCriterion(checkIns100, pt)).toBe('100 check-ins')
    expect(achievementCriterion(level5, pt)).toBe('Chegar ao nível 5')
    expect(achievementCriterion(level5, en)).toBe('Reach level 5')
    expect(achievementCriterion(automatic, pt)).toBe('66 dias cumpridos de um mesmo hábito')
    expect(achievementCriterion(comeback, en)).toBe('10 days kept after a knockout')
  })

  it('says what is missing, singular and plural', () => {
    expect(achievementRemaining({ ...checkIns10, progress: 7 }, pt)).toBe('Faltam 3 check-ins')
    expect(achievementRemaining({ ...checkIns10, progress: 9 }, pt)).toBe('Falta 1 check-in')
    expect(achievementRemaining(level5, en)).toBe('4 levels to go')
  })

  it('shows the progress and the bonus', () => {
    expect(achievementProgressLabel({ ...checkIns100, progress: 37 })).toBe('37 / 100')
    expect(achievementPercent({ ...checkIns100, progress: 37 })).toBe(37)
    expect(achievementPercent({ ...checkIns10, progress: 10 })).toBe(100)
    expect(achievementBonus(checkIns100, pt)).toBe('+100 moedas · +150 XP')
    expect(achievementBonus(checkIns100, en)).toBe('+100 coins · +150 XP')
  })
})

describe('groupAchievementsByFamily', () => {
  it('keeps the catalog order inside and across families', () => {
    const groups = groupAchievementsByFamily([checkIns10, checkIns100, streak7, comeback, automatic])

    expect(groups.map((group) => group.family)).toEqual(['CheckIns', 'Streak', 'Overcoming'])
    expect(groups[0].achievements).toEqual([checkIns10, checkIns100])
    expect(groups[2].achievements).toEqual([comeback, automatic])
  })
})

describe('nearestAchievements', () => {
  it('offers each familys next tier, furthest along first', () => {
    const near = nearestAchievements([
      { ...checkIns10, progress: 9 },
      checkIns100,
      { ...streak7, progress: 2 },
      { ...level5, progress: 4 },
    ])

    expect(near.map((item) => item.code)).toEqual(['CheckIns10', 'Level5', 'Streak7'])
  })

  it('moves to the next tier once a tier is unlocked', () => {
    const near = nearestAchievements([{ ...checkIns10, progress: 10, unlockedAt: '2026-10-28T12:00:00Z' }, { ...checkIns100, progress: 12 }])

    expect(near.map((item) => item.code)).toEqual(['CheckIns100'])
  })

  it('breaks ties by the catalog order, even with no progress at all', () => {
    const near = nearestAchievements([checkIns10, checkIns100, streak7, { ...level5, progress: 0 }, comeback, automatic])

    expect(near.map((item) => item.code)).toEqual(['CheckIns10', 'Streak7', 'Level5'])
  })

  it('counts the two one-off feats on their own', () => {
    expect(nearestAchievements([comeback, automatic], 3).map((item) => item.code)).toEqual(['Comeback', 'AutomaticHabit'])
  })

  it('is empty when everything is unlocked', () => {
    expect(nearestAchievements([{ ...checkIns10, unlockedAt: '2026-10-28T12:00:00Z' }])).toEqual([])
  })
})
