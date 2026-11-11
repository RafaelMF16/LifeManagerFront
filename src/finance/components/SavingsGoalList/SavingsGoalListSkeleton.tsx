import { useTranslation } from 'react-i18next'
import Skeleton from '../../../shared/components/Skeleton/Skeleton'
import SkeletonGroup from '../../../shared/components/Skeleton/SkeletonGroup'

const CARDS = [0, 1, 2]

/** The goals' first load: cards built from the real card classes (icon and name, bar, footer). */
function SavingsGoalListSkeleton() {
  const { t: translate } = useTranslation('finance')

  return (
    <SkeletonGroup label={translate('finance:savingsGoals.list.loading')}>
      <div className="lm-goal-list__grid">
        {CARDS.map((card) => (
          <div key={card} className="lm-goal-card">
            <div className="lm-goal-card__header">
              <Skeleton shape="block" width={36} height={36} />
              <Skeleton width={card % 2 === 0 ? 140 : 110} />
            </div>
            <div className="lm-goal-card__progress">
              <Skeleton width={180} />
              <Skeleton shape="block" width="100%" height={8} />
            </div>
            <div className="lm-goal-card__footer">
              <Skeleton width={150} />
              <Skeleton shape="block" width={72} height={20} />
            </div>
          </div>
        ))}
      </div>
    </SkeletonGroup>
  )
}

export default SavingsGoalListSkeleton
