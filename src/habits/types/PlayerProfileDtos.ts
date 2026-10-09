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
  /** Only on `GET Profile`: the latest knockout, often caused by the day close while the player was away. */
  lastKnockout?: LastKnockoutDto | null
}

export interface LastKnockoutDto {
  /** Its ledger entry id: grows, so a newer knockout has a larger one. */
  id: number
  /** `yyyy-MM-dd`. */
  occurredOn: string
  coinsLost: number
}
