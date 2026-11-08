import { useTranslation } from 'react-i18next'
import Skeleton from '../../../shared/components/Skeleton/Skeleton'
import SkeletonGroup from '../../../shared/components/Skeleton/SkeletonGroup'

const ROWS = [0, 1, 2, 3, 4]

/**
 * The transaction list's first load: rows built from the real row classes, so the columns (and the two-line block on
 * compact screens) line up with the transactions that replace them.
 */
function TransactionListSkeleton() {
  const { t: translate } = useTranslation('finance')

  return (
    <SkeletonGroup label={translate('finance:transactions.list.loading')}>
      {ROWS.map((row) => (
        <div key={row} className="lm-transaction-list__row">
          <span className="lm-transaction-list__date">
            <Skeleton width={36} />
          </span>
          <span className="lm-transaction-list__description">
            <Skeleton shape="circle" width={16} />
            <Skeleton width={row % 2 === 0 ? '60%' : '45%'} />
          </span>
          <span className="lm-transaction-list__category">
            <Skeleton shape="block" width={72} height={18} />
          </span>
          <span className="lm-transaction-list__amount">
            <Skeleton width={64} />
          </span>
          <div className="lm-transaction-list__actions">
            <Skeleton shape="block" width="var(--control-height-sm)" height="var(--control-height-sm)" />
            <Skeleton shape="block" width="var(--control-height-sm)" height="var(--control-height-sm)" />
          </div>
        </div>
      ))}
    </SkeletonGroup>
  )
}

export default TransactionListSkeleton
