import { useKeyedFetch } from './useKeyedFetch'
import { getGroupRanking, getRankingGroup, getRankingGroups } from '../services/rankingService'
import type { GroupRankingDto, RankingGroupDetailsDto, RankingGroupListItemDto } from '../types/RankingDtos'

export type { KeyedFetchStatus as RankingDataStatus } from './useKeyedFetch'

/** The user's groups, with their place in each this week. */
export function useRankingGroups() {
  return useKeyedFetch<RankingGroupListItemDto[]>('groups', (signal) => getRankingGroups(signal))
}

/** A group and its members; `errorCode` is `RankingGroups.NotFound` when the user isn't in it (anymore). */
export function useRankingGroup(groupId: number) {
  return useKeyedFetch<RankingGroupDetailsDto>(`group-${groupId}`, (signal) => getRankingGroup(groupId, signal))
}

/** A group's ranking in a week (`null` = the current one). */
export function useGroupRanking(groupId: number, weekStart: string | null) {
  return useKeyedFetch<GroupRankingDto>(`ranking-${groupId}-${weekStart ?? 'current'}`, (signal) =>
    getGroupRanking(groupId, weekStart, signal),
  )
}
