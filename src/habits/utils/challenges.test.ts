import i18next from 'i18next'
import { describe, expect, it } from 'vitest'
import enUS from '../locales/en-US'
import ptBR from '../locales/pt-BR'
import type { ChallengeDto } from '../types/ChallengeDtos'
import {
  challengeAmount,
  challengePace,
  challengePercent,
  challengeProgressLabel,
  challengeReward,
  groupByWeek,
  parseWholeNumber,
  summaryPlace,
} from './challenges'

const i18n = i18next.createInstance()
void i18n.init({
  resources: { 'en-US': { habits: enUS }, 'pt-BR': { habits: ptBR } },
  lng: 'pt-BR',
  ns: ['habits'],
  interpolation: { escapeValue: false },
})
const pt = i18n.getFixedT('pt-BR')
const en = i18n.getFixedT('en-US')

function challenge(overrides: Partial<ChallengeDto> = {}): ChallengeDto {
  return {
    id: 1,
    habitId: 7,
    habitName: 'Ler',
    type: 'Frequency',
    target: 5,
    unit: null,
    progress: 3,
    daysLeft: 3,
    weekStart: '2026-11-02',
    baseline: 3,
    effort: 'Stretch',
    rewardCoins: 60,
    rewardXp: 120,
    status: 'Active',
    completedAt: null,
    ...overrides,
  }
}

const water = (overrides: Partial<ChallengeDto> = {}) => challenge({ type: 'Volume', unit: 'ml', target: 10_000, progress: 8_500, ...overrides })

describe('challenge progress', () => {
  it('reads the share of the target, capped at 100', () => {
    expect(challengePercent(challenge())).toBe(60)
    expect(challengePercent(challenge({ progress: 9 }))).toBe(100)
  })

  it('labels days or amounts in both languages', () => {
    expect(challengeProgressLabel(challenge(), pt, 'pt-BR')).toBe('3 / 5 dias')
    expect(challengeProgressLabel(challenge(), en, 'en-US')).toBe('3 / 5 days')
    expect(challengeProgressLabel(water(), pt, 'pt-BR')).toBe('8.500 / 10.000 ml')
    expect(challengeAmount(1, challenge(), pt, 'pt-BR')).toBe('1 dia')
  })

  it('says the pace against the days left', () => {
    expect(challengePace(challenge(), pt, 'pt-BR')).toBe('Faltam 2 em 3 dias')
    expect(challengePace(challenge({ progress: 4, daysLeft: 1 }), pt, 'pt-BR')).toBe('Falta 1 em 1 dia')
    expect(challengePace(water(), en, 'en-US')).toBe('≈ 500 ml a day for 3 days')
    expect(challengePace(challenge({ progress: 0, daysLeft: 3 }), en, 'en-US')).toBe('5 days left to do: more than the days left')
  })

  it('says when it is done, failed or over', () => {
    expect(challengePace(challenge({ status: 'Completed', progress: 5 }), pt, 'pt-BR')).toBe('Concluído!')
    expect(challengePace(challenge({ status: 'Failed' }), pt, 'pt-BR')).toBe('Não deu desta vez')
    expect(challengePace(challenge({ daysLeft: 0 }), pt, 'pt-BR')).toBe('A semana acabou')
  })

  it('shows the reward', () => {
    expect(challengeReward(challenge(), pt)).toBe('+60 moedas · +120 XP')
  })
})

describe('parseWholeNumber', () => {
  it('reads whole numbers with or without thousand separators', () => {
    expect(parseWholeNumber(' 5 ')).toBe(5)
    expect(parseWholeNumber('10.000')).toBe(10_000)
    expect(parseWholeNumber('10 000')).toBe(10_000)
    expect(parseWholeNumber('2,5')).toBeNull()
    expect(parseWholeNumber('abc')).toBeNull()
  })
})

describe('groupByWeek', () => {
  it('groups consecutive weeks in order', () => {
    const groups = groupByWeek([
      challenge({ id: 1, weekStart: '2026-10-26' }),
      challenge({ id: 2, weekStart: '2026-10-26' }),
      challenge({ id: 3, weekStart: '2026-10-19' }),
    ])
    expect(groups.map((group) => [group.weekStart, group.challenges.length])).toEqual([
      ['2026-10-26', 2],
      ['2026-10-19', 1],
    ])
  })
})

describe('summaryPlace', () => {
  const place = { groupId: 1, groupName: 'Família', position: 2, memberCount: 5, points: 180, isFinal: false }

  it('says the place, marked provisional until the week closes', () => {
    expect(summaryPlace(place, pt)).toBe('2º de 5 · 180 pts · provisório')
    expect(summaryPlace({ ...place, isFinal: true }, en)).toBe('#2 of 5 · 180 pts')
  })
})
