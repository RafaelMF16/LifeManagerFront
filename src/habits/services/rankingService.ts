import { apiRequest } from '../../shared/services/httpClient'
import type {
  GroupRankingDto,
  RankingGroupDetailsDto,
  RankingGroupListItemDto,
  RankingGroupPreviewDto,
  RankingGroupRequestDto,
  RankingReactionKind,
  RankingReactionsDto,
} from '../types/RankingDtos'

const GROUPS_PATH = '/api/RankingGroups'

const invitePath = (code: string) => `${GROUPS_PATH}/Invites/${encodeURIComponent(code)}`
const reactionPath = (groupId: number, memberId: number) => `${GROUPS_PATH}/${groupId}/Members/${memberId}/Reaction`

/** The user's groups (at most 5, not paged), with their place in each this week. */
export function getRankingGroups(signal?: AbortSignal): Promise<RankingGroupListItemDto[]> {
  return apiRequest<RankingGroupListItemDto[]>(GROUPS_PATH, { method: 'GET', signal })
}

export function getRankingGroup(groupId: number, signal?: AbortSignal): Promise<RankingGroupDetailsDto> {
  return apiRequest<RankingGroupDetailsDto>(`${GROUPS_PATH}/${groupId}`, { method: 'GET', signal })
}

export function createRankingGroup(request: RankingGroupRequestDto): Promise<RankingGroupDetailsDto> {
  return apiRequest<RankingGroupDetailsDto>(GROUPS_PATH, { method: 'POST', body: request })
}

export function renameRankingGroup(groupId: number, request: RankingGroupRequestDto): Promise<RankingGroupDetailsDto> {
  return apiRequest<RankingGroupDetailsDto>(`${GROUPS_PATH}/${groupId}`, { method: 'PUT', body: request })
}

/** A new invite code (owner only): the old one stops working. */
export function regenerateInviteCode(groupId: number): Promise<RankingGroupDetailsDto> {
  return apiRequest<RankingGroupDetailsDto>(`${GROUPS_PATH}/${groupId}/InviteCode`, { method: 'POST' })
}

export function leaveRankingGroup(groupId: number): Promise<void> {
  return apiRequest<void>(`${GROUPS_PATH}/${groupId}/Leave`, { method: 'POST' })
}

export function removeRankingMember(groupId: number, memberId: number): Promise<void> {
  return apiRequest<void>(`${GROUPS_PATH}/${groupId}/Members/${memberId}`, { method: 'DELETE' })
}

/** The group behind an invite code, to confirm before joining. */
export function previewInvite(code: string, signal?: AbortSignal): Promise<RankingGroupPreviewDto> {
  return apiRequest<RankingGroupPreviewDto>(invitePath(code), { method: 'GET', signal })
}

export function joinInvite(code: string): Promise<RankingGroupDetailsDto> {
  return apiRequest<RankingGroupDetailsDto>(`${invitePath(code)}/Join`, { method: 'POST' })
}

/** The group's ranking in a week (`yyyy-MM-dd`, a Monday); the current week when omitted. */
export function getGroupRanking(groupId: number, weekStart: string | null, signal?: AbortSignal): Promise<GroupRankingDto> {
  const query = weekStart ? `?weekStart=${weekStart}` : ''
  return apiRequest<GroupRankingDto>(`${GROUPS_PATH}/${groupId}/Ranking${query}`, { method: 'GET', signal })
}

/** Reacts to a member's week (or changes the reaction); answers with that member's reactions in the week. */
export function setRankingReaction(groupId: number, memberId: number, weekStart: string, kind: RankingReactionKind): Promise<RankingReactionsDto> {
  return apiRequest<RankingReactionsDto>(reactionPath(groupId, memberId), { method: 'PUT', body: { weekStart, kind } })
}

export function removeRankingReaction(groupId: number, memberId: number, weekStart: string): Promise<RankingReactionsDto> {
  return apiRequest<RankingReactionsDto>(`${reactionPath(groupId, memberId)}?weekStart=${weekStart}`, { method: 'DELETE' })
}
