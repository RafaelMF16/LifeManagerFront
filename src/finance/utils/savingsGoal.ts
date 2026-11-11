import type { IconName } from '../../shared/components/Icon/Icon'
import type { SavingsGoalMonthDto, SavingsGoalPace, SavingsGoalResponseDto } from '../types/SavingsGoalDtos'
import { barRatio, niceMax } from './chartScale'

/** The icons a goal can pick, stored by id on the backend (`SavingsGoal.Icon`). `target` is the default. */
export const SAVINGS_GOAL_ICONS = [
  'target',
  'plane',
  'house',
  'car',
  'graduation-cap',
  'laptop',
  'tree-palm',
  'baby',
  'umbrella',
  'gift',
  'heart',
  'piggy-bank',
] as const satisfies readonly IconName[]

export type SavingsGoalIcon = (typeof SAVINGS_GOAL_ICONS)[number]

export const DEFAULT_SAVINGS_GOAL_ICON: SavingsGoalIcon = 'target'

/** The icon to draw for a stored id: anything unknown (or none) falls back to the default. */
export function savingsGoalIcon(id: string | null | undefined): SavingsGoalIcon {
  return SAVINGS_GOAL_ICONS.find((icon) => icon === id) ?? DEFAULT_SAVINGS_GOAL_ICON
}

/** A translation key with its interpolation values. */
export interface TextKey {
  key: string
  values?: Record<string, string | number>
}

/**
 * How far the deadline is, after "até dez/2027": the backend's `monthsLeft` counts the current month and the
 * deadline's, so the months still to go are one less ("faltam 13 meses" from nov/2026 to dez/2027).
 * Null without a deadline, or once the goal is done (nothing is left to wait for).
 */
export function deadlineCountdown(goal: Pick<SavingsGoalResponseDto, 'monthsLeft' | 'pace'>): TextKey | null {
  if (goal.monthsLeft === null || goal.pace === 'Done') return null
  if (goal.monthsLeft <= 0) return { key: 'finance:savingsGoals.deadline.passed' }
  if (goal.monthsLeft === 1) return { key: 'finance:savingsGoals.deadline.thisMonth' }
  return { key: 'finance:savingsGoals.deadline.monthsToGo', values: { count: goal.monthsLeft - 1 } }
}

/**
 * "Guarde R$ X/mês": shown while there is a deadline and something left. With the deadline this month (or already
 * past) the backend asks for everything left at once, so the text says "este mês" instead of "/mês".
 */
export function monthlyNeededText(
  goal: Pick<SavingsGoalResponseDto, 'monthsLeft' | 'monthlyNeeded' | 'remaining' | 'pace'>,
): { key: string; amount: number } | null {
  if (goal.monthlyNeeded === null || goal.monthsLeft === null || goal.pace === 'Done' || goal.remaining <= 0) return null
  return {
    key: goal.monthsLeft > 1 ? 'finance:savingsGoals.card.monthlyNeeded' : 'finance:savingsGoals.card.neededNow',
    amount: goal.monthlyNeeded,
  }
}

export type PaceTone = 'success' | 'positive' | 'warning'

/** The pace badge: always a word next to its color. A goal without a deadline has no pace to show. */
export function paceBadge(pace: SavingsGoalPace): { tone: PaceTone; labelKey: string } | null {
  switch (pace) {
    case 'Done':
      return { tone: 'success', labelKey: 'finance:savingsGoals.pace.Done' }
    case 'OnTrack':
      return { tone: 'positive', labelKey: 'finance:savingsGoals.pace.OnTrack' }
    case 'Behind':
      return { tone: 'warning', labelKey: 'finance:savingsGoals.pace.Behind' }
    default:
      return null
  }
}

/** The progress bar's length (0–1): past the target it stays full. */
export function progressBarRatio(ratio: number) {
  return barRatio(ratio, 1)
}

export interface SavingsChartBar {
  /** `yyyy-MM`. */
  month: string
  amount: number
  /** 0–1 of the scale's top. */
  ratio: number
}

/**
 * The monthly chart's geometry: a round top (`niceMax`) over the largest month, and each month's bar as a share of it.
 * Months that saved nothing (or went negative, a linked investment edited down) get a zero-length bar.
 */
export function savingsChartBars(monthly: SavingsGoalMonthDto[]): { scaleMax: number; bars: SavingsChartBar[] } {
  const scaleMax = niceMax(Math.max(0, ...monthly.map((item) => item.amount)))
  return {
    scaleMax,
    bars: monthly.map((item) => ({ month: item.month, amount: item.amount, ratio: barRatio(item.amount, scaleMax) })),
  }
}

export interface SavingsGoalOption {
  id: number
  name: string
  /** A goal the transaction already has but that was archived since: kept so editing doesn't drop it. */
  archived: boolean
}

/**
 * The goals an investment can be linked to (active and completed, A→Z), plus the transaction's current goal when it
 * is no longer among them (archived): keeping it is allowed, so the form must still show it.
 */
export function savingsGoalOptions(
  goals: Pick<SavingsGoalResponseDto, 'id' | 'name'>[],
  current: { id: number | null; name?: string | null } | null,
): SavingsGoalOption[] {
  const options = goals
    .map((goal) => ({ id: goal.id, name: goal.name, archived: false }))
    .sort((left, right) => left.name.localeCompare(right.name) || left.id - right.id)

  if (current?.id != null && !options.some((option) => option.id === current.id)) {
    options.push({ id: current.id, name: current.name ?? String(current.id), archived: true })
  }
  return options
}
