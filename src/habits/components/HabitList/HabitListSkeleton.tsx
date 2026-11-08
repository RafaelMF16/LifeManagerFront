import { useTranslation } from 'react-i18next'
import Skeleton from '../../../shared/components/Skeleton/Skeleton'
import SkeletonGroup from '../../../shared/components/Skeleton/SkeletonGroup'

const ROWS = [0, 1, 2, 3, 4]

/** The habits list's first load: rows built from the real row classes (name and badges, streak, actions). */
function HabitListSkeleton() {
  const { t: translate } = useTranslation('habits')

  return (
    <SkeletonGroup label={translate('habits:habits.list.loading')}>
      {ROWS.map((row) => (
        <div key={row} className="lm-habit-list__row">
          <div className="lm-habit-list__main">
            <Skeleton width={row % 2 === 0 ? '50%' : '35%'} />
            <span className="lm-habit-list__meta">
              <Skeleton shape="block" width={56} height={18} />
              <Skeleton shape="block" width={48} height={18} />
              <Skeleton width={96} />
            </span>
          </div>
          <span className="lm-habit-list__streaks">
            <Skeleton width={40} />
          </span>
          <div className="lm-habit-list__actions">
            <Skeleton shape="block" width="var(--control-height-sm)" height="var(--control-height-sm)" />
            <Skeleton shape="block" width="var(--control-height-sm)" height="var(--control-height-sm)" />
          </div>
        </div>
      ))}
    </SkeletonGroup>
  )
}

export default HabitListSkeleton
