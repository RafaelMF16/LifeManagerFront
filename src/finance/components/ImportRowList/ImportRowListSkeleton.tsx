import { useTranslation } from 'react-i18next'
import Skeleton from '../../../shared/components/Skeleton/Skeleton'
import SkeletonGroup from '../../../shared/components/Skeleton/SkeletonGroup'

const ROWS = [0, 1, 2, 3, 4]

/**
 * The statement lines' first load: rows built from the real row classes (checkbox, date and description, amount,
 * category select, actions).
 */
function ImportRowListSkeleton() {
  const { t: translate } = useTranslation('finance')

  return (
    <SkeletonGroup label={translate('finance:imports.rows.loading')} className="lm-import-rows__items">
      {ROWS.map((row) => (
        <div key={row} className="lm-import-rows__row">
          <Skeleton shape="block" width={16} height={16} className="lm-import-rows__select" />
          <div className="lm-import-rows__main">
            <span className="lm-import-rows__date">
              <Skeleton width={64} />
            </span>
            <span className="lm-import-rows__description">
              <Skeleton shape="circle" width={16} />
              <Skeleton width={row % 2 === 0 ? '65%' : '50%'} />
            </span>
          </div>
          <div className="lm-import-rows__amount">
            <Skeleton width={72} />
          </div>
          <Skeleton shape="block" height="var(--control-height-sm)" className="lm-import-rows__category" />
          <div className="lm-import-rows__actions">
            <Skeleton shape="block" width="var(--control-height-sm)" height="var(--control-height-sm)" />
            <Skeleton shape="block" width="var(--control-height-sm)" height="var(--control-height-sm)" />
          </div>
        </div>
      ))}
    </SkeletonGroup>
  )
}

export default ImportRowListSkeleton
