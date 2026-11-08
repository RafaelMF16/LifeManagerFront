import { useTranslation } from 'react-i18next'
import Skeleton from '../../../shared/components/Skeleton/Skeleton'
import SkeletonGroup from '../../../shared/components/Skeleton/SkeletonGroup'

const ROWS = [0, 1, 2, 3]

/** The redemptions' first load: rows built from the real row classes (icon, reward and date, cost, status). */
function RedemptionListSkeleton() {
  const { t: translate } = useTranslation('habits')

  return (
    <SkeletonGroup label={translate('habits:shop.redemptions.loading')} className="lm-redemption-list__rows">
      {ROWS.map((row) => (
        <div key={row} className="lm-redemption-list__row">
          <Skeleton shape="block" width={32} height={32} />
          <div className="lm-redemption-list__main">
            <Skeleton width={row % 2 === 0 ? '55%' : '40%'} />
            <Skeleton width={96} />
          </div>
          <span className="lm-redemption-list__cost">
            <Skeleton width={48} />
          </span>
          <div className="lm-redemption-list__status">
            <Skeleton shape="block" width={64} height="var(--control-height-sm)" />
          </div>
        </div>
      ))}
    </SkeletonGroup>
  )
}

export default RedemptionListSkeleton
