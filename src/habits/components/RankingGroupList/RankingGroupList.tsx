import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Button from '../../../shared/components/Button/Button'
import Icon from '../../../shared/components/Icon/Icon'
import type { RankingDataStatus } from '../../hooks/useRankingData'
import type { RankingGroupListItemDto } from '../../types/RankingDtos'
import { medal } from '../../utils/ranking'
import RankingGroupListSkeleton from './RankingGroupListSkeleton'
import './RankingGroupList.css'

interface RankingGroupListProps {
  groups: RankingGroupListItemDto[] | undefined
  status: RankingDataStatus
  isFetching: boolean
  onRetry: () => void
}

/** The user's groups as cards, each a link to its ranking, with their place and points this week. */
function RankingGroupList({ groups, status, isFetching, onRetry }: RankingGroupListProps) {
  const { t: translate } = useTranslation('habits')

  if (!groups) {
    return status === 'error' ? (
      <div className="lm-ranking-groups__state" role="alert">
        <p>{translate('habits:ranking.list.loadError')}</p>
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {translate('habits:ranking.retry')}
        </Button>
      </div>
    ) : (
      <RankingGroupListSkeleton />
    )
  }

  if (groups.length === 0) {
    return (
      <div className="lm-ranking-groups__empty" data-tour="ranking.groups">
        <Icon name="users" size={28} aria-hidden="true" />
        <p className="lm-ranking-groups__empty-title">{translate('habits:ranking.list.emptyTitle')}</p>
        <p className="lm-ranking-groups__empty-text">{translate('habits:ranking.list.emptyText')}</p>
      </div>
    )
  }

  return (
    <ul className={`lm-ranking-groups${isFetching ? ' lm-ranking-groups--fetching' : ''}`} data-tour="ranking.groups">
      {groups.map((group) => (
        <li key={group.id} className="lm-ranking-groups__card">
          <Link to={`/habits/ranking/${group.id}`} className="lm-ranking-groups__link">
            <span className="lm-ranking-groups__name">{group.name}</span>
          </Link>
          <span className="lm-ranking-groups__meta">
            <Icon name="users" size={14} aria-hidden="true" />
            {translate('habits:ranking.members.count', { count: group.memberCount })}
            {group.isOwner ? <span className="lm-ranking-groups__owner">{translate('habits:ranking.members.owner')}</span> : null}
          </span>
          {group.myPosition !== null ? (
            <span className="lm-ranking-groups__place">
              <span className="lm-ranking-groups__position">
                {medal(group.myPosition) ?? `${group.myPosition}º`}
              </span>
              {translate('habits:ranking.list.myPlace', { position: group.myPosition, points: group.myPoints })}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

export default RankingGroupList
