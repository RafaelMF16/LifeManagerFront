import { useTranslation } from 'react-i18next'
import Skeleton from '../../../shared/components/Skeleton/Skeleton'
import SkeletonGroup from '../../../shared/components/Skeleton/SkeletonGroup'

const ITEMS = [0, 1, 2]

/** The imports list's first load: items built from the real item classes (file, details, actions). */
function StatementImportListSkeleton() {
  const { t: translate } = useTranslation('finance')

  return (
    <SkeletonGroup label={translate('finance:imports.list.loading')} className="lm-import-list__items">
      {ITEMS.map((item) => (
        <div key={item} className="lm-import-list__item">
          <div className="lm-import-list__main">
            <span className="lm-import-list__name">
              <Skeleton shape="circle" width={14} />
              <Skeleton width={item % 2 === 0 ? 180 : 140} />
            </span>
            <span className="lm-import-list__meta">
              <Skeleton shape="pill" width={64} height={18} />
              <Skeleton width={88} />
              <Skeleton width={72} />
            </span>
          </div>
          <div className="lm-import-list__actions">
            <Skeleton shape="block" width={96} height="var(--control-height-sm)" />
            <Skeleton shape="block" width="var(--control-height-sm)" height="var(--control-height-sm)" />
          </div>
        </div>
      ))}
    </SkeletonGroup>
  )
}

export default StatementImportListSkeleton
