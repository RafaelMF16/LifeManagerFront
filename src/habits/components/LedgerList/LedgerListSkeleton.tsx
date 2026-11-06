import { useTranslation } from 'react-i18next'
import Skeleton from '../../../shared/components/Skeleton/Skeleton'
import SkeletonGroup from '../../../shared/components/Skeleton/SkeletonGroup'

const ROWS = [0, 1, 2, 3, 4]

/** The statement's first load: rows built from the real row classes (icon, title and day, changes). */
function LedgerListSkeleton() {
  const { t: translate } = useTranslation('habits')

  return (
    <SkeletonGroup label={translate('habits:history.loading')} className="lm-ledger-list__rows">
      {ROWS.map((row) => (
        <div key={row} className="lm-ledger-list__row">
          <Skeleton shape="block" width={32} height={32} />
          <div className="lm-ledger-list__main">
            <Skeleton width={row % 2 === 0 ? '60%' : '45%'} />
            <Skeleton width={80} />
          </div>
          <div className="lm-ledger-list__deltas">
            <Skeleton shape="pill" width={56} height={20} />
          </div>
        </div>
      ))}
    </SkeletonGroup>
  )
}

export default LedgerListSkeleton
