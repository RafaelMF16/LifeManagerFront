import type { SortDirection } from '../../shared/types/Paging'

// Espelha LifeManager.Domain/Habits/Enums (binds by name).
export type HabitKind = 'Positive' | 'Negative'
export type HabitDifficulty = 'Easy' | 'Medium' | 'Hard'
export type HabitFrequencyType = 'Daily' | 'WeekDays' | 'TimesPerWeek'
export type HabitStatusFilter = 'Active' | 'Archived'
export type HabitSortBy = 'Name' | 'CreatedAt'

/** .NET's `DayOfWeek` names, which is how the API sends a WeekDays habit's days. */
export type WeekDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'

export const WEEK_DAYS: readonly WeekDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// Espelha LifeManager.Application/Habits/DTOs
export interface HabitUpdateRequestDto {
  name: string
  description: string | null
  trigger: string | null
  difficulty: HabitDifficulty
  frequencyType: HabitFrequencyType
  /** Only for `WeekDays`; null otherwise. */
  weekDays: WeekDay[] | null
  /** 1–6, only for `TimesPerWeek`; null otherwise. */
  timesPerWeek: number | null
  /** The daily target of a habit to build (1–100000); null, with the unit and step, for a one-tap habit. */
  targetValue: number | null
  targetUnit: string | null
  /** The quick-add amount (1 up to the target); null for none. */
  targetStep: number | null
}

/** The kind is fixed once the habit is created, so only the create request carries it. */
export interface HabitRequestDto extends HabitUpdateRequestDto {
  kind: HabitKind
}

export interface HabitResponseDto {
  id: number
  name: string
  description: string | null
  trigger: string | null
  kind: HabitKind
  difficulty: HabitDifficulty
  frequencyType: HabitFrequencyType
  /** Monday first; empty unless the frequency is `WeekDays`. */
  weekDays: WeekDay[]
  timesPerWeek: number | null
  /** `yyyy-MM-dd`. */
  startDate: string
  /** In days, or in weeks for a `TimesPerWeek` habit. */
  currentStreak: number
  longestStreak: number
  /** Null while the habit is active. */
  archivedAt: string | null
  /** The daily target; null, with the unit and step, for a one-tap habit. */
  targetValue: number | null
  targetUnit: string | null
  targetStep: number | null
}

// Espelha HabitListQueryDto (query string de GET /api/Habits)
export interface HabitListQuery {
  page: number
  pageSize: number
  status: HabitStatusFilter
  search?: string
  sortBy: HabitSortBy
  sortDirection: SortDirection
}
