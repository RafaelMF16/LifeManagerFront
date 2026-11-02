import type { PagedResponse } from '../../shared/types/Paging'

// Espelha LifeManager.Domain/Habits/Enums (binds by name).
export type ChallengeType = 'Frequency' | 'Volume'
export type ChallengeStatus = 'Active' | 'Completed' | 'Failed' | 'Cancelled'
export type ChallengeEffort = 'Light' | 'Steady' | 'Stretch'
export type ChallengeWeek = 'Current' | 'Next'

// Espelha LifeManager.Application/Habits/DTOs/ChallengeDtos
export interface ChallengeDto {
  id: number
  habitId: number
  habitName: string
  type: ChallengeType
  target: number
  /** The daily target's unit, for a volume challenge; null for frequency. */
  unit: string | null
  /** Days done (frequency) or amount logged (volume) in the week, recounted by the backend from what is stored. */
  progress: number
  /** Days left to play, today included: 7 before the week starts, 0 once it ended. */
  daysLeft: number
  /** Monday, `yyyy-MM-dd`. */
  weekStart: string
  /** The weekly average when it was created; null without a closed week. */
  baseline: number | null
  effort: ChallengeEffort
  rewardCoins: number
  rewardXp: number
  status: ChallengeStatus
  completedAt: string | null
}

export interface ChallengeSuggestionDto {
  habitId: number
  habitName: string
  type: ChallengeType
  target: number
  unit: string | null
  baseline: number
  effort: ChallengeEffort
  rewardCoins: number
  rewardXp: number
}

/** A habit the form can pick, with its target's limits for the week. */
export interface ChallengeHabitOptionDto {
  habitId: number
  name: string
  unit: string | null
  maxFrequency: number
  /** Null for a habit without a daily target (frequency only). */
  maxVolume: number | null
  frequencyProgress: number
  volumeProgress: number
}

/** `GET /api/Habits/Challenges?week=`. */
export interface ChallengeWeekDto {
  week: ChallengeWeek
  weekStart: string
  weekEnd: string
  /** The week still takes challenges: the current one until Wednesday, the next one always. */
  isOpen: boolean
  /** Open, with room and a habit to pick. */
  canCreate: boolean
  challenges: ChallengeDto[]
  suggestions: ChallengeSuggestionDto[]
  habits: ChallengeHabitOptionDto[]
}

export interface CreateChallengeRequestDto {
  habitId: number
  type: ChallengeType
  target: number
  week: ChallengeWeek
}

export interface ChallengePreviewDto {
  effort: ChallengeEffort
  rewardCoins: number
  rewardXp: number
  baseline: number | null
}

export type ChallengeHistoryDto = PagedResponse<ChallengeDto>

/** One week's figures in the weekly summary. */
export interface WeeklySummaryFiguresDto {
  checkIns: number
  cleanDays: number
  /** Coins earned with habits (undos taken back) plus the rewards of the challenges completed. */
  coins: number
  challengesCompleted: number
}

/** `GET /api/Habits/Challenges/Summary`: last week, shown once; the endpoint answers 204 when there is none to show. */
export interface WeeklySummaryDto {
  /** Monday of the summarized week, `yyyy-MM-dd`. */
  weekStart: string
  weekEnd: string
  week: WeeklySummaryFiguresDto
  /** The week before it, to compare. */
  previousWeek: WeeklySummaryFiguresDto
  challenges: ChallengeDto[]
  /** The player's place in each ranking group that week, best first; empty without groups. */
  ranking: RankingWeekPlaceDto[]
}

/** The player's place in one ranking group in the summarized week. */
export interface RankingWeekPlaceDto {
  groupId: number
  groupName: string
  position: number
  /** The lines of that week's board. */
  memberCount: number
  points: number
  /** From the stored result; otherwise live and provisional (the week isn't closed yet). */
  isFinal: boolean
}
