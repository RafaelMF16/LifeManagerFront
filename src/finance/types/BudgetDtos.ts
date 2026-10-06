// Espelha LifeManager.Domain/Budgets: a goal is a spending limit (Expense) or an investment target (Investment).
export type BudgetType = 'Expense' | 'Investment'

// Espelha LifeManager.Application/Budgets/DTOs
export interface BudgetRequestDto {
  type: BudgetType
  /** Null for a goal on the month's total. */
  categoryId: number | null
  /** `yyyy-MM`: the amount applies from this month on, until changed. */
  from: string
  amount: number
}

export interface BudgetResponseDto {
  id: number
  type: BudgetType
  categoryId: number | null
  categoryName: string | null
  amount: number
  /** `yyyy-MM`. */
  effectiveFrom: string
  /** `yyyy-MM`; null while open-ended. */
  effectiveTo: string | null
}

/** One goal against the month's actual amount. Amounts are positive. */
export interface BudgetProgressDto {
  /** The version in force this month: what a removal from this month refers to. */
  id: number
  /** Null for the goal on the month's total. */
  categoryId: number | null
  categoryName: string | null
  goal: number
  actual: number
  /** Goal − actual; negative when a limit was passed or a target exceeded. */
  remaining: number
  /** Actual / goal (1 = exactly the goal). */
  ratio: number
  /** Within the limit (expense) or at least the target (investment). */
  achieved: boolean
  /** `yyyy-MM`. */
  effectiveFrom: string
  /** `yyyy-MM`; null while open-ended. */
  effectiveTo: string | null
}

export interface BudgetGroupDto {
  /** The month's whole total of the type, with or without a goal on it. */
  actual: number
  /** The goal on the month's total; null when there is none. */
  total: BudgetProgressDto | null
  /** Per-category goals, by category name. */
  categories: BudgetProgressDto[]
}

export interface BudgetMonthResponseDto {
  /** `yyyy-MM`. */
  month: string
  expenses: BudgetGroupDto
  investments: BudgetGroupDto
}
