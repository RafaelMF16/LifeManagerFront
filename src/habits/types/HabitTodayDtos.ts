import type { HabitDifficulty, HabitFrequencyType } from './HabitDtos'
import type { PlayerProfileDto } from './PlayerProfileDtos'

// Espelha LifeManager.Application/Habits/DTOs (HabitTodayDto, HabitCheckInResultDto, WalletChangeDto)

/** `GET /api/Habits/Today`. */
export interface HabitTodayDto {
  /** Today in the backend's business time zone, `yyyy-MM-dd`. */
  date: string
  today: HabitTodayItemDto[]
  /** Yesterday's habits not checked in yet: they can still be, until today ends. */
  yesterdayPending: HabitTodayItemDto[]
  /** The latest day an active habit was missed in the last 7 days (`yyyy-MM-dd`); null when none. */
  lastMissedOn: string | null
  recentMissCount: number
}

export interface HabitTodayItemDto {
  id: number
  name: string
  trigger: string | null
  difficulty: HabitDifficulty
  frequencyType: HabitFrequencyType
  timesPerWeek: number | null
  currentStreak: number
  longestStreak: number
  /** Whether it is checked in on the day of the list it is in. */
  done: boolean
  /** `TimesPerWeek` only: check-ins in that day's week (Monday to Sunday). */
  weekDoneCount: number | null
  /** Coins a check-in would earn now; 0 once a weekly target is met. */
  coinsPreview: number
}

/** What a change did to the player; deltas are what was actually applied. */
export interface WalletChangeDto {
  profile: PlayerProfileDto
  coinsDelta: number
  xpDelta: number
  hpDelta: number
  levelsGained: number
  knockedOut: boolean
  knockoutCoinsLost: number
}

/** `POST /api/Habits/{id}/CheckIns` and `DELETE /api/Habits/{id}/CheckIns/{date}`. */
export interface HabitCheckInResultDto {
  habitId: number
  date: string
  /** False after an undo. */
  done: boolean
  currentStreak: number
  longestStreak: number
  /** Everything applied, the milestone's coins included. */
  wallet: WalletChangeDto
  /** The biggest streak milestone passed (7, 30, 66, 100 days); null when none. */
  milestoneDays: number | null
  /** Coins those milestones added (already in `wallet.coinsDelta`). */
  milestoneCoins: number
  /** Streak freezes earned (the player holds at most 2). */
  freezesEarned: number
}
