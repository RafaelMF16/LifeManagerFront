import type { SortDirection } from '../../shared/types/Paging'

// Espelha LifeManager.Domain/SavingsGoals/Enums (binds by name).
export type SavingsGoalPace = 'OnTrack' | 'Behind' | 'NoDeadline' | 'Done'
export type SavingsGoalStatusFilter = 'Active' | 'Completed' | 'Archived'
export type SavingsGoalSortBy = 'Name' | 'TargetMonth' | 'Progress'

// Espelha LifeManager.Application/SavingsGoals/DTOs
export interface SavingsGoalRequestDto {
  name: string
  targetAmount: number
  /** `yyyy-MM`, the current month or later; null means no deadline. */
  targetMonth: string | null
  /** What was already saved before the goal; zero or more. */
  initialAmount: number
  /** An icon id from `SAVINGS_GOAL_ICONS`. */
  icon: string | null
}

export interface SavingsGoalMonthDto {
  /** `yyyy-MM`. */
  month: string
  amount: number
}

export interface SavingsGoalResponseDto {
  id: number
  name: string
  targetAmount: number
  /** `yyyy-MM`; null without a deadline. */
  targetMonth: string | null
  initialAmount: number
  icon: string | null
  createdAt: string
  /** Null while the goal is active. */
  archivedAt: string | null
  /** ISO date the target was first reached; kept even if the amount saved drops later. */
  completedAt: string | null
  /** The initial amount plus every linked investment. */
  saved: number
  /** Saved ÷ target; above 1 once the target is passed. */
  ratio: number
  /** What is left to save; 0 once reached. */
  remaining: number
  /** From the current month through the deadline, both included (0 or less once it passed); null without one. */
  monthsLeft: number | null
  /** Remaining ÷ months left, rounded up to the cent; null without a deadline. */
  monthlyNeeded: number | null
  pace: SavingsGoalPace
  /** Only on `GET /api/SavingsGoals/{id}`: the last 12 months, the current one last. */
  monthly?: SavingsGoalMonthDto[]
}

/** A transaction linked to the goal, from any month. */
export interface SavingsGoalTransactionDto {
  id: number
  monthlySummaryId: number
  categoryId: number
  categoryName: string
  /** Always positive. */
  amount: number
  description: string
  /** ISO date, `YYYY-MM-DD`. */
  date: string
}

// Espelha SavingsGoalListQueryDto (query string de GET /api/SavingsGoals)
export interface SavingsGoalListQuery {
  page: number
  pageSize: number
  status: SavingsGoalStatusFilter
  search?: string
  sortBy: SavingsGoalSortBy
  sortDirection: SortDirection
}
