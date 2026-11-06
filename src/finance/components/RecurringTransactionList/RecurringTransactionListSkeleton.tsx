import { useTranslation } from 'react-i18next'
import Skeleton from '../../../shared/components/Skeleton/Skeleton'
import SkeletonGroup from '../../../shared/components/Skeleton/SkeletonGroup'

const ROWS = [0, 1, 2, 3]

/** The recurring transactions' first load: cards built from the real row classes (text, figures, actions). */
function RecurringTransactionListSkeleton() {
  const { t: translate } = useTranslation('finance')

  return (
    <SkeletonGroup label={translate('finance:recurring.list.loading')}>
      {ROWS.map((row) => (
        <div key={row} className="lm-recurring-list__row">
          <div className="lm-recurring-list__main">
            <span className="lm-recurring-list__description">
              <Skeleton shape="circle" width={16} />
              <Skeleton width={row % 2 === 0 ? 160 : 120} />
            </span>
            <span className="lm-recurring-list__meta">
              <Skeleton shape="block" width={72} height={18} />
              <Skeleton width={128} />
            </span>
          </div>
          <div className="lm-recurring-list__figures">
            <Skeleton width={72} />
            <Skeleton width={96} />
          </div>
          <div className="lm-recurring-list__actions">
            <Skeleton shape="block" width="var(--control-height-sm)" height="var(--control-height-sm)" />
            <Skeleton shape="block" width="var(--control-height-sm)" height="var(--control-height-sm)" />
            <Skeleton shape="block" width="var(--control-height-sm)" height="var(--control-height-sm)" />
          </div>
        </div>
      ))}
    </SkeletonGroup>
  )
}

export default RecurringTransactionListSkeleton
