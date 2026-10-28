// Espelha LifeManager.Domain/Achievements/Enums (binds by name).
export type AchievementCode =
  | 'CheckIns10'
  | 'CheckIns100'
  | 'CheckIns500'
  | 'Streak7'
  | 'Streak30'
  | 'Streak100'
  | 'Level5'
  | 'Level10'
  | 'Level25'
  | 'Redemptions1'
  | 'Redemptions10'
  | 'CleanDays10'
  | 'CleanDays50'
  | 'CleanDays200'
  | 'Comeback'
  | 'AutomaticHabit'
export type AchievementFamily = 'CheckIns' | 'Streak' | 'Level' | 'Redemptions' | 'CleanDays' | 'Overcoming'
export type AchievementTier = 'Bronze' | 'Silver' | 'Gold'

// Espelha LifeManager.Application/Achievements/DTOs
/** One achievement and where the player stands with it. */
export interface AchievementDto {
  code: AchievementCode
  family: AchievementFamily
  tier: AchievementTier
  threshold: number
  /** Towards the threshold, never past it; the threshold once unlocked. */
  progress: number
  coinsBonus: number
  xpBonus: number
  /** Null while locked. */
  unlockedAt: string | null
}

/** `GET /api/Achievements`: the whole catalog, in its order. */
export interface AchievementsResponseDto {
  achievements: AchievementDto[]
  unlockedCount: number
  total: number
}

/** An unlock the player hasn't been shown yet (`GET /api/Habits/Profile`), with the bonus it paid. */
export interface NewAchievementDto {
  code: AchievementCode
  tier: AchievementTier
  coinsBonus: number
  xpBonus: number
  unlockedAt: string
}
