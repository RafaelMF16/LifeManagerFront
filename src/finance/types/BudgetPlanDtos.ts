// Espelha LifeManager.Domain/BudgetPlans: a slice is a spending limit for a category (Expense) or the month's
// investment target (Investment, with no category).
export type BudgetSliceType = 'Expense' | 'Investment'

// Espelha LifeManager.Application/BudgetPlans/DTOs
export interface BudgetSliceDto {
  type: BudgetSliceType
  /** Required for an expense; null for the investment slice. */
  categoryId: number | null
  /** Share of the total: greater than 0, at most 100, 2 decimals (25 = 25%). */
  percent: number
}

/** Body of `PUT /api/BudgetPlans/{month}`: the month's whole plan. */
export interface BudgetPlanRequestDto {
  total: number
  /** At most 100% in all. */
  slices: BudgetSliceDto[]
}

/** One slice against what was actually spent or invested. Amounts are positive. */
export interface BudgetSliceProgressDto {
  type: BudgetSliceType
  categoryId: number | null
  categoryName: string | null
  percent: number
  /** total × percent, rounded to cents. */
  amount: number
  /** Spent in the category, or everything invested in the month for the investment slice. */
  actual: number
  /** Actual / amount (1 = exactly the slice). */
  ratio: number
  /** Within the limit (expense) or at least the target (investment). */
  achieved: boolean
}

export interface BudgetPlanResponseDto {
  /** `yyyy-MM`. */
  month: string
  /** Whether the month has a plan; when false there is no total and no slice. */
  exists: boolean
  total: number | null
  /** Expense slices by category name, then the investment slice. */
  slices: BudgetSliceProgressDto[]
  /** What the slices leave (100 without a plan). */
  freePercent: number
  /** The free part in money, closing with the total; null without a plan. */
  freeAmount: number | null
  /** Spent in categories without a slice (everything spent, without a plan). */
  freeActual: number
  /** `yyyy-MM`: the latest earlier month with a plan, to offer copying it; null when there is none. */
  copySource: string | null
}
