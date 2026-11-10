import type { HomeBestStreakDto, HomeHabitsDto, HomePlayerDto } from '../types/HomeOverview'

export interface HabitsProgress {
  done: number
  due: number
  /** 0–1, for the progress bar. */
  ratio: number
}

/** What the Home's habits card shows, decided from the overview (the card only translates and lays it out). */
export type HabitsCardState =
  /** Never played (no profile) and nothing in force: invite to create the first habit. */
  | { kind: 'new' }
  /** A player with nothing due, pending or in force today. */
  | { kind: 'nothingToday' }
  | {
      kind: 'summary'
      /** Null when only habits to avoid are in force today. */
      progress: HabitsProgress | null
      yesterdayPending: number
      bestStreak: HomeBestStreakDto | null
      relapsedToday: number
    }

export function habitsCardState(habits: HomeHabitsDto, player: HomePlayerDto | null): HabitsCardState {
  const { dueToday, doneToday, yesterdayPending, avoiding, relapsedToday, bestStreak } = habits

  if (dueToday === 0 && yesterdayPending === 0 && avoiding === 0 && bestStreak === null)
    return player === null ? { kind: 'new' } : { kind: 'nothingToday' }

  return {
    kind: 'summary',
    progress: dueToday > 0 ? { done: doneToday, due: dueToday, ratio: doneToday / dueToday } : null,
    yesterdayPending,
    bestStreak,
    relapsedToday,
  }
}
