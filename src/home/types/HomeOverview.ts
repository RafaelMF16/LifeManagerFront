/** `GET /api/Home/Overview`: the day's summary. Mirrors `HomeOverviewDto` in the backend. */
export interface HomeOverviewDto {
  /** The business time zone's today, `yyyy-MM-dd`. */
  today: string
  habits: HomeHabitsDto
  /** Null before the player's first move in the habits game. */
  player: HomePlayerDto | null
  finance: HomeFinanceDto
}

export interface HomeHabitsDto {
  /** Habits to build that can be checked in today. */
  dueToday: number
  doneToday: number
  /** Habits to build that can still be checked in for yesterday. */
  yesterdayPending: number
  /** Habits to avoid in force today. */
  avoiding: number
  relapsedToday: number
  bestStreak: HomeBestStreakDto | null
}

export interface HomeBestStreakDto {
  habitId: number
  name: string
  /** In days: a weekly habit's weeks count 7 days each. */
  days: number
}

export interface HomePlayerDto {
  level: number
  hp: number
  maxHp: number
  coins: number
}

export interface HomeFinanceDto {
  /** `yyyy-MM`. */
  month: string
  /** Null when the month doesn't exist yet (totals are then zero). */
  monthlySummaryId: number | null
  income: number
  expense: number
  investment: number
  balance: number
  /** Null without a budget plan for the month. */
  budget: HomeBudgetDto | null
}

export interface HomeBudgetDto {
  /** The plan's total minus its investment slice. */
  spendingLimit: number
  /** The month's expenses. */
  spent: number
  /** The expense slice furthest along its amount; null without expense slices. */
  tightest: HomeTightestSliceDto | null
}

export interface HomeTightestSliceDto {
  categoryId: number
  name: string
  /** Spent over the slice's amount (1 = exactly at it). */
  ratio: number
}
