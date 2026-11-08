import { useTranslation } from 'react-i18next'
import Skeleton from '../../../shared/components/Skeleton/Skeleton'
import SkeletonGroup from '../../../shared/components/Skeleton/SkeletonGroup'

const CARDS = [0, 1, 2, 3]

/** The groups' first load: cards built from the real card classes (name, members, my place). */
function RankingGroupListSkeleton() {
  const { t: translate } = useTranslation('habits')

  return (
    <SkeletonGroup label={translate('habits:ranking.list.loading')} className="lm-ranking-groups">
      {CARDS.map((card) => (
        <div key={card} className="lm-ranking-groups__card">
          <Skeleton width={card % 2 === 0 ? '60%' : '45%'} height={20} />
          <Skeleton width={96} />
          <Skeleton width="70%" />
        </div>
      ))}
    </SkeletonGroup>
  )
}

export default RankingGroupListSkeleton
