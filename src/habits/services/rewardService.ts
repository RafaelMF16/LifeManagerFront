import { apiRequest } from '../../shared/services/httpClient'
import type { PagedResponse } from '../../shared/types/Paging'
import type {
  EarningPaceDto,
  RewardListQuery,
  RewardRedemptionDto,
  RewardRedemptionResultDto,
  RewardRequestDto,
  RewardResponseDto,
} from '../types/RewardDtos'
import type { RewardFormValues } from '../validation/rewardSchema'

const REWARDS_PATH = '/api/Rewards'

/** The cost is typed as text. */
export function toRequestDto(values: RewardFormValues): RewardRequestDto {
  return { name: values.name, cost: Number(values.cost), icon: values.icon }
}

export function getRewards(query: RewardListQuery, signal?: AbortSignal): Promise<PagedResponse<RewardResponseDto>> {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    status: query.status,
    sortBy: query.sortBy,
    sortDirection: query.sortDirection,
  })
  if (query.search) params.set('search', query.search)

  return apiRequest<PagedResponse<RewardResponseDto>>(`${REWARDS_PATH}?${params}`, { method: 'GET', signal })
}

export function createReward(values: RewardFormValues): Promise<RewardResponseDto> {
  return apiRequest<RewardResponseDto>(REWARDS_PATH, { method: 'POST', body: toRequestDto(values) })
}

export function updateReward(id: number, values: RewardFormValues): Promise<RewardResponseDto> {
  return apiRequest<RewardResponseDto>(`${REWARDS_PATH}/${id}`, { method: 'PUT', body: toRequestDto(values) })
}

/** Archives the reward: its redemptions stay and it can be restored. */
export async function archiveReward(id: number): Promise<void> {
  await apiRequest<void>(`${REWARDS_PATH}/${id}`, { method: 'DELETE' })
}

export function restoreReward(id: number): Promise<RewardResponseDto> {
  return apiRequest<RewardResponseDto>(`${REWARDS_PATH}/${id}/Restore`, { method: 'POST' })
}

/** Spends the reward's price; rejects with `Rewards.InsufficientCoins` when the balance is short. */
export function redeemReward(id: number): Promise<RewardRedemptionResultDto> {
  return apiRequest<RewardRedemptionResultDto>(`${REWARDS_PATH}/${id}/Redeem`, { method: 'POST' })
}

/** Gives a redemption's coins back; only on the day it was made. */
export function undoRedemption(redemptionId: number): Promise<RewardRedemptionResultDto> {
  return apiRequest<RewardRedemptionResultDto>(`${REWARDS_PATH}/Redemptions/${redemptionId}`, { method: 'DELETE' })
}

/** Newest first. */
export function getRedemptions(page: number, pageSize: number, signal?: AbortSignal): Promise<PagedResponse<RewardRedemptionDto>> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  return apiRequest<PagedResponse<RewardRedemptionDto>>(`${REWARDS_PATH}/Redemptions?${params}`, { method: 'GET', signal })
}

export function getEarningPace(signal?: AbortSignal): Promise<EarningPaceDto> {
  return apiRequest<EarningPaceDto>(`${REWARDS_PATH}/EarningPace`, { method: 'GET', signal })
}
