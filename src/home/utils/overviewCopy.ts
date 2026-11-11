import type { HomeBestStreakDto, HomeFinanceDto, HomeHabitsDto, HomePlayerDto } from '../types/HomeOverview'

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

export interface FinanceBudgetState {
  spent: number
  limit: number
  /** 0–1 for the bar: spending past the limit fills it. */
  barRatio: number
  over: boolean
  tightest: { name: string; ratio: number } | null
}

/** What the Home's finance card shows for the current month. */
export type FinanceCardState =
  /** The month doesn't exist yet: "November has no transactions yet". */
  | { kind: 'noMonth'; month: string }
  | {
      kind: 'month'
      monthlySummaryId: number
      income: number
      expense: number
      balance: number
      budget: FinanceBudgetState | null
    }

export function financeCardState(finance: HomeFinanceDto): FinanceCardState {
  if (finance.monthlySummaryId === null) return { kind: 'noMonth', month: finance.month }

  const { budget } = finance

  return {
    kind: 'month',
    monthlySummaryId: finance.monthlySummaryId,
    income: finance.income,
    expense: finance.expense,
    balance: finance.balance,
    budget: budget
      ? {
          spent: budget.spent,
          limit: budget.spendingLimit,
          barRatio: budget.spendingLimit > 0 ? Math.min(budget.spent / budget.spendingLimit, 1) : 1,
          over: budget.spent > budget.spendingLimit,
          tightest: budget.tightest ? { name: budget.tightest.name, ratio: budget.tightest.ratio } : null,
        }
      : null,
  }
}

/** "Novembro" / "November" from a `yyyy-MM`. */
export function monthName(month: string, language: string): string {
  const [year, monthNumber] = month.split('-').map(Number)
  const text = new Intl.DateTimeFormat(language, { month: 'long', timeZone: 'UTC' }).format(Date.UTC(year, monthNumber - 1, 1))
  return text.charAt(0).toLocaleUpperCase() + text.slice(1)
}
