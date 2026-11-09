import i18next from 'i18next'
import { describe, expect, it } from 'vitest'
import enUS from '../locales/en-US'
import ptBR from '../locales/pt-BR'
import type { AchievementDto } from '../types/AchievementDtos'
import {
  achievementBonus,
  achievementCriterion,
  achievementFamilyIcon,
  achievementName,
  achievementPercent,
  achievementProgressLabel,
  achievementRemaining,
  achievementTitle,
  groupAchievementsByFamily,
  initiallyOpenFamilies,
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
const wins5 = achievement({ code: 'RankingWins5', family: 'Ranking', tier: 'Silver', threshold: 5, progress: 4 })
const podiums3 = achievement({ code: 'RankingPodiums3', family: 'Ranking', threshold: 3, progress: 1 })

const budget3 = achievement({ code: 'BudgetMonths3', family: 'Finance', tier: 'Silver', threshold: 3, progress: 1 })
const savings1 = achievement({ code: 'SavingsMonths1', family: 'Finance', threshold: 1 })

describe('Finance achievements', () => {
  it('has an icon, names and texts for each of its numbers', () => {
    expect(achievementFamilyIcon('Finance')).toBe('piggy-bank')
    expect(achievementName('InvestmentMonths12', pt)).toBe('Um ano investindo')
    expect(achievementTitle('SavingsMonths12', en)).toBe('Full vault')
    expect(achievementCriterion(budget3, pt)).toBe('3 meses fechados dentro do orçamento')
    expect(achievementRemaining(budget3, en)).toBe('2 months within the budget to go')
    expect(achievementCriterion(savings1, pt)).toBe('1 mês fechado poupando 20% da renda')
  })

  it('counts each of its numbers as its own next goal', () => {
    expect(nearestAchievements([budget3, savings1], 5)).toEqual([budget3, savings1])
  })

  it('falls back to an icon for a family this frontend does not know', () => {
    expect(achievementFamilyIcon('Unknown' as AchievementDto['family'])).toBe('trophy')
  })
})

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

  it('tells the ranking wins from the podiums', () => {
    expect(achievementName('RankingWins1', pt)).toBe('Primeira vitória')
    expect(achievementCriterion(wins5, pt)).toBe('5 semanas em 1º num grupo')
    expect(achievementCriterion(podiums3, en)).toBe('3 weeks on a group’s podium')
    expect(achievementRemaining(wins5, pt)).toBe('Falta 1 vitória')
    expect(achievementRemaining(podiums3, en)).toBe('2 podiums to go')
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

describe('initiallyOpenFamilies', () => {
  const catalog = [
    achievement({ code: 'CheckIns10', family: 'CheckIns', unlockedAt: '2026-10-01T12:00:00Z' }),
    achievement({ code: 'CheckIns100', family: 'CheckIns' }),
    achievement({ code: 'Streak7', family: 'Streak' }),
    achievement({ code: 'Level5', family: 'Level', unlockedAt: '2026-10-02T12:00:00Z' }),
    achievement({ code: 'Redemptions1', family: 'Redemptions' }),
  ]
  const near = [achievement({ code: 'Streak7', family: 'Streak' }), achievement({ code: 'CheckIns100', family: 'CheckIns' })]

  it('opens every family on wide screens', () => {
    expect(initiallyOpenFamilies(catalog, near, false, [])).toEqual(new Set(['CheckIns', 'Streak', 'Level', 'Redemptions']))
  })

  it('opens only the first "Almost there" family on compact screens when nothing is unseen', () => {
    expect(initiallyOpenFamilies(catalog, near, true, [])).toEqual(new Set(['Streak']))
  })

  it('also opens the families of unseen unlocks on compact screens', () => {
    expect(initiallyOpenFamilies(catalog, near, true, ['Level5'])).toEqual(new Set(['Streak', 'Level']))
  })

  it('opens nothing on compact screens when nothing is near or unseen', () => {
    expect(initiallyOpenFamilies(catalog, [], true, [])).toEqual(new Set())
  })
})
