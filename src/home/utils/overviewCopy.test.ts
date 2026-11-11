import { describe, expect, it } from 'vitest'
import type { HomeFinanceDto, HomeHabitsDto, HomePlayerDto } from '../types/HomeOverview'
import { financeCardState, habitsCardState, monthName } from './overviewCopy'

const noHabits: HomeHabitsDto = { dueToday: 0, doneToday: 0, yesterdayPending: 0, avoiding: 0, relapsedToday: 0, bestStreak: null }
const player: HomePlayerDto = { level: 3, hp: 80, maxHp: 100, coins: 240 }

describe('habitsCardState', () => {
  it('invites a new player to create the first habit', () => {
    expect(habitsCardState(noHabits, null)).toEqual({ kind: 'new' })
  })

  it('says there is nothing for today when a player has no habit due', () => {
    expect(habitsCardState(noHabits, player)).toEqual({ kind: 'nothingToday' })
  })

  it('sums up the day with the progress, the pending day, the streak and the relapses', () => {
    const bestStreak = { habitId: 7, name: 'Ler 10 páginas', days: 12 }

    expect(
      habitsCardState({ dueToday: 4, doneToday: 1, yesterdayPending: 1, avoiding: 2, relapsedToday: 1, bestStreak }, player),
    ).toEqual({
      kind: 'summary',
      progress: { done: 1, due: 4, ratio: 0.25 },
      yesterdayPending: 1,
      bestStreak,
      relapsedToday: 1,
    })
  })

  it('has no progress bar when only habits to avoid are in force', () => {
    const state = habitsCardState({ ...noHabits, avoiding: 1 }, null)

    expect(state).toEqual({ kind: 'summary', progress: null, yesterdayPending: 0, bestStreak: null, relapsedToday: 0 })
  })

  it('is a summary, not an empty card, when only a streak is left (habits off today)', () => {
    const bestStreak = { habitId: 1, name: 'Correr', days: 3 }

    expect(habitsCardState({ ...noHabits, bestStreak }, player).kind).toBe('summary')
  })
})

const emptyMonth: HomeFinanceDto = {
  month: '2026-11',
  monthlySummaryId: null,
  income: 0,
  expense: 0,
  investment: 0,
  balance: 0,
  budget: null,
}

describe('financeCardState', () => {
  it('says the month has no transactions yet when it does not exist', () => {
    expect(financeCardState(emptyMonth)).toEqual({ kind: 'noMonth', month: '2026-11' })
  })

  it('shows the month without a budget', () => {
    const finance = { ...emptyMonth, monthlySummaryId: 47, income: 8000, expense: 3120.5, investment: 1000, balance: 3879.5 }

    expect(financeCardState(finance)).toEqual({
      kind: 'month',
      monthlySummaryId: 47,
      income: 8000,
      expense: 3120.5,
      balance: 3879.5,
      budget: null,
    })
  })

  it('caps the budget bar at full and flags spending past the limit', () => {
    const finance = {
      ...emptyMonth,
      monthlySummaryId: 47,
      budget: { spendingLimit: 1000, spent: 1250, tightest: { categoryId: 3, name: 'Mercado', ratio: 1.4 } },
    }

    const state = financeCardState(finance)

    expect(state.kind === 'month' && state.budget).toEqual({
      spent: 1250,
      limit: 1000,
      barRatio: 1,
      over: true,
      tightest: { name: 'Mercado', ratio: 1.4 },
    })
  })

  it('keeps a budget without expense slices (no tightest) and one of a month not created yet', () => {
    const budget = { spendingLimit: 4500, spent: 0, tightest: null }

    expect(financeCardState({ ...emptyMonth, monthlySummaryId: 1, budget })).toMatchObject({
      budget: { barRatio: 0, over: false, tightest: null },
    })
    expect(financeCardState({ ...emptyMonth, budget }).kind).toBe('noMonth')
  })
})

describe('monthName', () => {
  it('names the month of a yyyy-MM, capitalized, in the given language', () => {
    expect(monthName('2026-11', 'pt-BR')).toBe('Novembro')
    expect(monthName('2026-01', 'en-US')).toBe('January')
  })
})
