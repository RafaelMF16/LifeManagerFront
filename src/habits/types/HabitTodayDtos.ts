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
  /** Habits to avoid in force today (a weekly limit always is). */
  avoiding: HabitAvoidItemDto[]
  /** Names of set-days habits to avoid whose day off is today. */
  freeToday: string[]
}

/** A habit to avoid on the day's checklist. */
export interface HabitAvoidItemDto {
  id: number
  name: string
  trigger: string | null
  difficulty: HabitDifficulty
  frequencyType: HabitFrequencyType
  /** The weekly limit, for `TimesPerWeek`. */
  timesPerWeek: number | null
  /** Clean days in a row (weeks within the limit, for a weekly limit). */
  currentStreak: number
  longestStreak: number
  relapsedToday: boolean
  relapsedYesterday: boolean
  /** Yesterday was avoided, can still change and has no relapse. */
  canRelapseYesterday: boolean
  /** Weekly limit only: relapses logged this week. */
  weekRelapseCount: number | null
  /** HP a relapse today would cost: 0 while within a weekly limit, or once relapsed today. */
  damagePreview: number
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

/** `POST /api/Habits/{id}/Relapses` and `DELETE /api/Habits/{id}/Relapses/{date}`. */
export interface HabitRelapseResultDto {
  habitId: number
  date: string
  /** False after an undo. */
  relapsed: boolean
  currentStreak: number
  longestStreak: number
  wallet: WalletChangeDto
  /** Weekly limit only: the week's relapses now. */
  weekRelapseCount: number | null
}
