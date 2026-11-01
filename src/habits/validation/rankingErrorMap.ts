import type { ApiErrorFieldMap } from '../../shared/utils/applyApiErrorToForm'
import type { RankingGroupFormValues } from './rankingGroupSchema'

// Espelha os códigos de LifeManager.Domain/RankingGroups/Errors e LifeManager.Domain/Ranking/Errors.
export const RANKING_GROUP_NOT_FOUND_CODE = 'RankingGroups.NotFound'
export const RANKING_INVITE_NOT_FOUND_CODE = 'RankingGroups.InviteNotFound'
export const RANKING_TOO_MANY_GROUPS_CODE = 'RankingGroups.TooManyGroups'
export const RANKING_GROUP_FULL_CODE = 'RankingGroups.GroupFull'
export const RANKING_ALREADY_MEMBER_CODE = 'RankingGroups.AlreadyMember'
export const RANKING_NOT_OWNER_CODE = 'RankingGroups.NotOwner'
export const RANKING_GROUP_MEMBER_NOT_FOUND_CODE = 'RankingGroups.MemberNotFound'
export const RANKING_MEMBER_NOT_FOUND_CODE = 'Ranking.MemberNotFound'
export const RANKING_REACTION_OUT_OF_WINDOW_CODE = 'Ranking.ReactionOutOfWindow'
export const RANKING_WEEK_OUT_OF_RANGE_CODE = 'Ranking.WeekOutOfRange'
export const RANKING_TOO_MANY_REQUESTS_CODE = 'Auth.TooManyRequests'

export const rankingGroupErrorFieldMap: ApiErrorFieldMap<RankingGroupFormValues> = {
  'RankingGroups.NameIsNullOrWhiteSpace': { field: 'name', message: 'habits:ranking.validation.name.required' },
  'RankingGroups.NameTooLong': { field: 'name', message: 'habits:ranking.validation.name.tooLong' },
}

/** The translation key that explains a refused invite (preview or join); null for errors the caller handles itself. */
export function inviteErrorKey(code: string): string | null {
  switch (code) {
    case RANKING_INVITE_NOT_FOUND_CODE:
      return 'habits:ranking.join.errors.notFound'
    case RANKING_TOO_MANY_GROUPS_CODE:
      return 'habits:ranking.join.errors.tooManyGroups'
    case RANKING_GROUP_FULL_CODE:
      return 'habits:ranking.join.errors.full'
    case RANKING_ALREADY_MEMBER_CODE:
      return 'habits:ranking.join.errors.alreadyMember'
    case RANKING_TOO_MANY_REQUESTS_CODE:
      return 'habits:ranking.join.errors.tooManyRequests'
    default:
      return null
  }
}
