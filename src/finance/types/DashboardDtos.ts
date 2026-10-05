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

export interface FinanceDashboardResponseDto {
  period: DashboardPeriodDto
  comparisonPeriod: DashboardPeriodDto
  totals: DashboardTotalsDto
  months: DashboardMonthDto[]
  expenses: DashboardCategoryBreakdownDto
  investments: DashboardCategoryBreakdownDto
}
