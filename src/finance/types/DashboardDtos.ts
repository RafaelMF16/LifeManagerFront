// Espelha LifeManager.Domain/FinanceDashboard/Enums/DashboardComparison.cs (binds by name in the query string).
export type DashboardComparison = 'PreviousPeriod' | 'SamePeriodLastYear'

/** Query string of GET /api/FinanceDashboard: whole months, `yyyy-MM`, both included. */
export interface FinanceDashboardQuery {
  from: string
  to: string
  comparison: DashboardComparison
}

/** The period options the dashboard offers; past years carry the year (`year:2025`). */
export type DashboardPresetId = 'thisMonth' | 'last3Months' | 'last6Months' | 'last12Months' | 'thisYear' | `year:${number}`

// Espelha LifeManager.Application/FinanceDashboard/DTOs
export interface DashboardPeriodDto {
  /** `yyyy-MM`. */
  from: string
  /** `yyyy-MM`. */
  to: string
  monthCount: number
}

/** One figure in the period and in the comparison period. `changeRatio` is 0.12 for +12%; null when previous is 0. */
export interface DashboardAmountDto {
  current: number
  previous: number
  difference: number
  changeRatio: number | null
}

export interface DashboardTotalsDto {
  income: DashboardAmountDto
  expense: DashboardAmountDto
  investment: DashboardAmountDto
  /** Income − expenses − investment; can be negative. */
  balance: DashboardAmountDto
}

/** One month of the period; months with no transactions come with zeros. */
export interface DashboardMonthDto {
  year: number
  month: number
  income: number
  expense: number
  investment: number
  balance: number
}

export interface DashboardCategoryDto {
  categoryId: number
  name: string
  amount: number
  previousAmount: number
  changeRatio: number | null
  /** Part of the breakdown's total (0–1). */
  share: number
  /** One amount per month of the period, in the same order as `months`. */
  monthlyAmounts: number[]
}

/** Every category beyond the listed ones, summed together. */
export interface DashboardOthersDto {
  categoryCount: number
  amount: number
  previousAmount: number
  changeRatio: number | null
  share: number
  monthlyAmounts: number[]
}

export interface DashboardCategoryBreakdownDto {
  total: number
  previousTotal: number
  changeRatio: number | null
  /** Biggest first. */
  items: DashboardCategoryDto[]
  /** Null when every category is listed. */
  others: DashboardOthersDto | null
}

/** A month's goals on its totals; a goal and its flag are null when the month had none. */
export interface DashboardBudgetMonthDto {
  year: number
  month: number
  expenseGoal: number | null
  expenseAchieved: boolean | null
  investmentGoal: number | null
  investmentAchieved: boolean | null
}

/** A month-total goal over the months of the period that had it (the current month included). */
export interface DashboardBudgetSummaryDto {
  /** Those months' goals, summed. */
  goal: number
  /** What was actually spent or invested in those same months. */
  actual: number
  /** Actual / goal; null when no month had the goal. */
  ratio: number | null
  monthsWithGoal: number
  monthsAchieved: number
}

/** One category's goal over the months of the period that had it. */
export interface DashboardBudgetCategoryDto {
  categoryId: number
  name: string
  goal: number
  actual: number
  ratio: number
  /** Summed over the months: spent over the limit (expense) or missing to the target (investment). */
  gap: number
  monthsWithGoal: number
  monthsAchieved: number
}

export interface DashboardBudgetsDto {
  /** Whether any goal was in force in the period. */
  hasGoals: boolean
  /** One row per month, in the same order as `months`. */
  months: DashboardBudgetMonthDto[]
  expense: DashboardBudgetSummaryDto
  investment: DashboardBudgetSummaryDto
  /** Most overspent first (top 5). */
  expenseCategories: DashboardBudgetCategoryDto[]
  /** Furthest from the target first (top 5). */
  investmentCategories: DashboardBudgetCategoryDto[]
}

export interface FinanceDashboardResponseDto {
  period: DashboardPeriodDto
  comparisonPeriod: DashboardPeriodDto
  totals: DashboardTotalsDto
  months: DashboardMonthDto[]
  expenses: DashboardCategoryBreakdownDto
  investments: DashboardCategoryBreakdownDto
  budgets: DashboardBudgetsDto
}
