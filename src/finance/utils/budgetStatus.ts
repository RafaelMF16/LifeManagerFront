import type { BudgetType } from '../types/BudgetDtos'

/**
 * How a goal is going: a spending limit is on track, close to it (from `NEAR_LIMIT_RATIO`) or passed; an
 * investment target is reached or not yet.
 */
export type BudgetStatus = 'onTrack' | 'nearLimit' | 'overLimit' | 'reached' | 'belowTarget'

/** From this share of a spending limit on, the goal shows as close to it. */
export const NEAR_LIMIT_RATIO = 0.8

/** `ratio` is actual / goal, as the backend sends it (1 = exactly the goal). */
export function budgetStatus(type: BudgetType, ratio: number): BudgetStatus {
  if (type === 'Investment') return ratio >= 1 ? 'reached' : 'belowTarget'
  if (ratio > 1) return 'overLimit'
  return ratio >= NEAR_LIMIT_RATIO ? 'nearLimit' : 'onTrack'
}

/** Whether a month is still running (or still ahead), so its goal can't be judged yet. */
export function isMonthOpen(year: number, month: number, today: Date) {
  return year * 12 + month >= today.getFullYear() * 12 + today.getMonth() + 1
}

/**
 * "Achieved in X of N months" over the months already closed: the running month is left out, since a limit can
 * still be passed and a target still reached before it ends. `achieved` is null for months without the goal.
 */
export function closedMonthsScore(months: { year: number; month: number; achieved: boolean | null }[], today: Date) {
  const closed = months.filter((month) => month.achieved !== null && !isMonthOpen(month.year, month.month, today))

  return { achieved: closed.filter((month) => month.achieved).length, total: closed.length }
}
