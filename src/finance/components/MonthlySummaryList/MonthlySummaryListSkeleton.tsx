import { useTranslation } from 'react-i18next'
import Skeleton from '../../../shared/components/Skeleton/Skeleton'
import SkeletonGroup from '../../../shared/components/Skeleton/SkeletonGroup'

const ROWS = [0, 1, 2, 3]
const CELLS = ['income', 'expense', 'investment', 'balance'] as const

/**
 * The months list's first load: rows built from the real row and cell classes, so they follow its columns on wide
 * screens and its labelled blocks on compact ones.
 */
function MonthlySummaryListSkeleton() {
  const { t: translate } = useTranslation('finance')

  return (
    <SkeletonGroup label={translate('finance:months.list.loading')}>
      {ROWS.map((row) => (
        <div key={row} className="lm-month-list__row">
          <span className="lm-month-list__period">
            <Skeleton width={112} />
          </span>
          {CELLS.map((cell) => (
            <span key={cell} className={`lm-month-list__cell lm-month-list__cell--${cell}`}>
              <span className="lm-month-list__cell-label">
                <Skeleton width={56} />
              </span>
              <Skeleton width={80} />
            </span>
          ))}
        </div>
      ))}
    </SkeletonGroup>
  )
}

export default MonthlySummaryListSkeleton
