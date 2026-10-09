// Espelha LifeManager.Domain/Habits/Enums/GameLedgerEntryKind (binds by name) e Application/Habits/DTOs/GameLedgerEntryDtos
export type GameLedgerEntryKind =
  | 'HabitDone'
  | 'HabitMissed'
  | 'Relapse'
  | 'CleanDay'
  | 'StreakMilestone'
  | 'RewardRedeemed'
  | 'Knockout'
  | 'Undo'
  | 'FreezeUsed'
  | 'LevelUp'

/** One line of the player's statement (`GET /api/Habits/Ledger`). */
export interface GameLedgerEntryDto {
  id: number
  kind: GameLedgerEntryKind
  /** The game day it belongs to, `yyyy-MM-dd`. */
  occurredOn: string
  createdAt: string
  coinsDelta: number
  xpDelta: number
  hpDelta: number
  /** The habit or reward name as it was then; null for level-ups and knockouts. */
  description: string | null
  habitId: number | null
  rewardId: number | null
}
