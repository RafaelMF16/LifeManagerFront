import type { SortDirection } from '../../shared/types/Paging'
import type { WalletChangeDto } from './HabitTodayDtos'

// Espelha LifeManager.Domain/Rewards/Enums (binds by name).
export type RewardStatusFilter = 'Active' | 'Archived'
export type RewardSortBy = 'Name' | 'Cost'

// Espelha LifeManager.Application/Rewards/DTOs
export interface RewardRequestDto {
  name: string
  /** In coins. */
  cost: number
  /** An id from `REWARD_ICONS`. */
  icon: string
}

export interface RewardResponseDto {
  id: number
  name: string
  cost: number
  icon: string | null
  createdAt: string
  /** Null while the reward is active. */
  archivedAt: string | null
}

export interface RewardListQuery {
  page: number
  pageSize: number
  status: RewardStatusFilter
  search: string
  sortBy: RewardSortBy
  sortDirection: SortDirection
}

/** One redemption, with the reward's name, icon and price as they were then. */
export interface RewardRedemptionDto {
  id: number
  rewardId: number
  rewardName: string
  rewardIcon: string | null
  costPaid: number
  /** The backend's game day, `yyyy-MM-dd`. */
  redeemedOn: string
  redeemedAt: string
  undoneAt: string | null
  /** Not undone yet and made today (the backend's today): only then the coins can come back. */
  canUndo: boolean
}

/** `POST /api/Rewards/{id}/Redeem` and `DELETE /api/Rewards/Redemptions/{id}`. */
export interface RewardRedemptionResultDto {
  redemption: RewardRedemptionDto
  wallet: WalletChangeDto
}

/** `GET /api/Rewards/EarningPace`: coins earned with habits per day lately (0 when none). */
export interface EarningPaceDto {
  averageDailyCoins: number
  windowDays: number
}
