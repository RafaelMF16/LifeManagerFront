import { useTranslation } from 'react-i18next'
import Skeleton from '../../../shared/components/Skeleton/Skeleton'
import SkeletonGroup from '../../../shared/components/Skeleton/SkeletonGroup'

const CARDS = [0, 1, 2, 3]

/** The shop's first load: cards in the real grid and card classes (icon, name and price, redeem button). */
function RewardListSkeleton() {
  const { t: translate } = useTranslation('habits')

  return (
    <SkeletonGroup label={translate('habits:shop.list.loading')} className="lm-reward-list__grid">
      {CARDS.map((card) => (
        <div key={card} className="lm-reward-list__card">
          <div className="lm-reward-list__top">
            <Skeleton shape="block" width={40} height={40} />
            <div className="lm-reward-list__info">
              <Skeleton width={card % 2 === 0 ? '70%' : '50%'} />
              <Skeleton width="40%" />
            </div>
          </div>
          <div className="lm-reward-list__actions">
            <Skeleton shape="block" height="var(--control-height-sm)" className="lm-reward-list__redeem" />
            <Skeleton shape="block" width="var(--control-height-sm)" height="var(--control-height-sm)" />
            <Skeleton shape="block" width="var(--control-height-sm)" height="var(--control-height-sm)" />
          </div>
        </div>
      ))}
    </SkeletonGroup>
  )
}

export default RewardListSkeleton
