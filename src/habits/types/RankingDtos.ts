import type { AchievementCode } from './AchievementDtos'
import type { PlayerAvatar } from './PlayerProfileDtos'

// Espelha LifeManager.Application/RankingGroups/DTOs e LifeManager.Application/Ranking/DTOs (enums bind by name).

/** `GET /api/RankingGroups`: one of the user's groups, with their place this week. */
export interface RankingGroupListItemDto {
  id: number
  name: string
  memberCount: number
  isOwner: boolean
  /** Null only for a group with no ranking yet. */
  myPosition: number | null
  myPoints: number
}

/** A member as the group sees them; `memberId` is the only id, never the user's. */
export interface RankingGroupMemberDto {
  memberId: number
  name: string
  avatar: PlayerAvatar
  title: AchievementCode | null
  /** `yyyy-MM-dd`. */
  joinedOn: string
  isOwner: boolean
  isMe: boolean
}

export interface RankingGroupDetailsDto {
  id: number
  name: string
  inviteCode: string
  isOwner: boolean
  createdOn: string
  /** Oldest first. */
  members: RankingGroupMemberDto[]
}

/** What an invite shows before joining. */
export interface RankingGroupPreviewDto {
  name: string
  ownerName: string
  memberCount: number
  alreadyMember: boolean
}

export interface RankingGroupRequestDto {
  name: string
}

export type RankingWeekStatus = 'Open' | 'Closing' | 'Final'
export type RankingReactionKind = 'Clap' | 'Fire'

export interface RankingReactionsDto {
  clap: number
  fire: number
  /** The user's own reaction to this member's week. */
  mine: RankingReactionKind | null
}

export interface RankingReactedByDto {
  memberId: number
  name: string
  kind: RankingReactionKind
}

/** A line of the ranking. `memberId` is null for someone who has left since (a stored week). */
export interface RankingEntryDto {
  memberId: number | null
  name: string
  avatar: PlayerAvatar
  title: AchievementCode | null
  points: number
  perfectDays: number
  keptDays: number
  position: number
  isMe: boolean
  /** In from the week's Monday: only then does the week count for their achievements. */
  eligible: boolean
  leftGroup: boolean
  reactions: RankingReactionsDto
  /** Who reacted: only on the user's own line. */
  reactedBy: RankingReactedByDto[] | null
}

export interface WeeklyScoreDayDto {
  date: string
  /** Habits kept that day, capped at 5. */
  kept: number
  perfect: boolean
  points: number
}

export interface RankingMeDto {
  /** Null when the user wasn't in the group that week. */
  position: number | null
  points: number
  /** Points behind the member right ahead; null when first. */
  gapToNext: number | null
  nextName: string | null
  days: WeeklyScoreDayDto[]
}

export interface RankingMemberRefDto {
  memberId: number
  name: string
}

/** Last week's podium, sent with the current week. */
export interface RankingPreviousDto {
  weekStart: string
  status: RankingWeekStatus
  podium: RankingEntryDto[]
  myPosition: number | null
  myPoints: number | null
}

/** `GET /api/RankingGroups/{id}/Ranking?weekStart=`. */
export interface GroupRankingDto {
  weekStart: string
  weekEnd: string
  status: RankingWeekStatus
  countsForAchievements: boolean
  /** The group's first week: the navigation stops there. */
  firstWeekStart: string
  entries: RankingEntryDto[]
  me: RankingMeDto
  overtakenBy: RankingMemberRefDto[]
  previous: RankingPreviousDto | null
}

export interface RankingReactionRequestDto {
  weekStart: string
  kind: RankingReactionKind
}
