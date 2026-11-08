import { useTranslation } from 'react-i18next'
import Skeleton from '../../../shared/components/Skeleton/Skeleton'
import SkeletonGroup from '../../../shared/components/Skeleton/SkeletonGroup'

const ROWS = [0, 1, 2, 3, 4]
const NAME_WIDTHS = ['40%', '28%', '52%', '34%', '45%']

/** The category list's first load: rows built from the real row classes (name, then the two actions). */
function CategoryListSkeleton() {
  const { t: translate } = useTranslation('finance')

  return (
    <SkeletonGroup label={translate('finance:categories.list.loading')}>
      {ROWS.map((row) => (
        <div key={row} className="lm-category-list__row">
          <span className="lm-category-list__name">
            <Skeleton width={NAME_WIDTHS[row]} />
          </span>
          <div className="lm-category-list__actions">
            <Skeleton shape="block" width="var(--control-height-sm)" height="var(--control-height-sm)" />
            <Skeleton shape="block" width="var(--control-height-sm)" height="var(--control-height-sm)" />
          </div>
        </div>
      ))}
    </SkeletonGroup>
  )
}

export default CategoryListSkeleton
