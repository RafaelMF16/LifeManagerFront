import { describe, expect, it } from 'vitest'
import type { HomeHabitsDto, HomePlayerDto } from '../types/HomeOverview'
import { habitsCardState } from './overviewCopy'

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
