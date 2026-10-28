import type { AchievementCode, NewAchievementDto } from './AchievementDtos'

// Espelha LifeManager.Domain/Habits/Enums/PlayerAvatar (binds by name).
export type PlayerAvatar =
  | 'Cat'
  | 'Dog'
  | 'Bird'
  | 'Rabbit'
  | 'Fish'
  | 'Turtle'
  | 'Squirrel'
  | 'Panda'
  | 'Rocket'
  | 'Flame'
  | 'Mountain'
  | 'Bot'

/** `GET /api/Habits/Profile`: the player's character. A user who never played gets a new player's values. */
export interface PlayerProfileDto {
  level: number
  /** XP earned since the current level started. */
  xpInLevel: number
  /** XP the current level needs in total to reach the next one. */
  xpToNextLevel: number
  totalXp: number
  hp: number
  maxHp: number
  coins: number
  streakFreezes: number
  maxStreakFreezes: number
  avatar: PlayerAvatar
  /** The unlocked achievement whose title the player shows; null for none. */
  title: AchievementCode | null
  /** Only on `GET Profile`: the latest knockout, often caused by the day close while the player was away. */
  lastKnockout?: LastKnockoutDto | null
  /** Only on `GET Profile`: unlocks the player hasn't been shown yet, in catalog order; empty elsewhere. */
  newAchievements?: NewAchievementDto[]
}

export interface LastKnockoutDto {
  /** Its ledger entry id: grows, so a newer knockout has a larger one. */
  id: number
  /** `yyyy-MM-dd`. */
  occurredOn: string
  coinsLost: number
}

/** `PUT /api/Habits/Profile/Appearance`. */
export interface UpdateAppearanceRequestDto {
  avatar: PlayerAvatar
  /** Must be an unlocked achievement; null takes the title off. */
  title: AchievementCode | null
}

/** `GET /api/Habits/Profile/Stats`: lifetime numbers, archived habits included. */
export interface PlayerStatsDto {
  checkIns: number
  cleanDays: number
  /** A weekly habit's weeks count 7 days each. */
  longestStreakDays: number
  mostKeptDaysInOneHabit: number
  /** Days with at least one check-in done or clean. */
  activeDays: number
  habitsCreated: number
  redemptions: number
  coinsEarned: number
  coinsSpent: number
  knockouts: number
  achievementsUnlocked: number
  /** `yyyy-MM-dd` of the first ledger entry; null before any. */
  playingSince: string | null
}

export type EvolutionRange = 'Month' | 'Quarter' | 'Year'

/** `GET /api/Habits/Profile/Evolution`: one point per game day, oldest first, the last one today. */
export interface PlayerEvolutionDto {
  range: EvolutionRange
  points: EvolutionPointDto[]
}

export interface EvolutionPointDto {
  /** `yyyy-MM-dd`. */
  date: string
  /** The XP total at the end of that day. */
  totalXp: number
  /** The coin balance at the end of that day. */
  coins: number
}
