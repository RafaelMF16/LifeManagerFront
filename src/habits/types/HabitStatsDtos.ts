import type { HabitResponseDto } from './HabitDtos'

// Espelha LifeManager.Domain/Habits (HabitDayState, HabitConsistencyUnit) e Application/Habits/DTOs/HabitStatsDto
export type HabitDayState = 'BeforeStart' | 'Off' | 'None' | 'Pending' | 'Done' | 'Clean' | 'Frozen' | 'Missed' | 'Relapse'
export type HabitConsistencyUnit = 'Days' | 'Weeks'

export interface HabitDayDto {
  /** `yyyy-MM-dd`. */
  date: string
  state: HabitDayState
}

export interface HabitConsistencyDto {
  achieved: number
  due: number
  /** Null while nothing was judged yet. */
  percent: number | null
  /** Days for daily and set-days habits (last 30 days); weeks for times-per-week habits (last 4 closed weeks). */
  unit: HabitConsistencyUnit
}

/** `GET /api/Habits/{id}/Stats`. */
export interface HabitStatsDto {
  habit: HabitResponseDto
  /** The backend's today, `yyyy-MM-dd`: the heatmap's last day. */
  today: string
  /** The heatmap's days, oldest first, ending today. */
  days: HabitDayDto[]
  consistency: HabitConsistencyDto
  /** Days done (or clean, to avoid) since the habit started. */
  totalKept: number
}
