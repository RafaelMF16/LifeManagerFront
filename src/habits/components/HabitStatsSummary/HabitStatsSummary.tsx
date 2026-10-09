import { useTranslation } from 'react-i18next'
import Icon from '../../../shared/components/Icon/Icon'
import type { HabitStatsDto } from '../../types/HabitStatsDtos'
import './HabitStatsSummary.css'

/** Lally (2010): about 66 days of practice, on average, until a habit runs on its own. */
export const AUTOMATIC_DAYS = 66

interface HabitStatsSummaryProps {
  stats: HabitStatsDto
}

/**
 * Three tiles: the streak (with the record always beside it), the recent consistency — the number that matters most,
 * since one miss doesn't undo a habit — and the days kept on the way to 66.
 */
function HabitStatsSummary({ stats }: HabitStatsSummaryProps) {
  const { t: translate } = useTranslation('habits')
  const { habit, consistency, totalKept } = stats
  const weekly = habit.frequencyType === 'TimesPerWeek'
  const towardAutomatic = Math.min(totalKept / AUTOMATIC_DAYS, 1)

  return (
    <dl className="lm-habit-stats">
      <div className="lm-habit-stats__tile">
        <dt className="lm-habit-stats__label">{translate('habits:details.summary.streak')}</dt>
        <dd className="lm-habit-stats__value">
          <Icon name="flame" size={20} aria-hidden="true" className="lm-habit-stats__flame" />
          {translate(weekly ? 'habits:details.summary.weeks' : 'habits:details.summary.days', { count: habit.currentStreak })}
        </dd>
        <dd className="lm-habit-stats__detail">
          {translate(weekly ? 'habits:details.summary.recordWeeks' : 'habits:details.summary.recordDays', {
            count: habit.longestStreak,
          })}
        </dd>
      </div>

      <div className="lm-habit-stats__tile">
        <dt className="lm-habit-stats__label">
          {translate(consistency.unit === 'Weeks' ? 'habits:details.summary.consistencyWeeks' : 'habits:details.summary.consistencyDays')}
        </dt>
        <dd className="lm-habit-stats__value">
          {consistency.percent === null ? '—' : translate('habits:details.summary.percent', { value: consistency.percent })}
        </dd>
        <dd className="lm-habit-stats__detail">
          {consistency.percent === null
            ? translate('habits:details.summary.nothingYet')
            : translate(consistency.unit === 'Weeks' ? 'habits:details.summary.ofWeeks' : 'habits:details.summary.ofDays', {
                achieved: consistency.achieved,
                count: consistency.due,
              })}
        </dd>
      </div>

      <div className="lm-habit-stats__tile">
        <dt className="lm-habit-stats__label">{translate('habits:details.summary.automatic')}</dt>
        <dd className="lm-habit-stats__value">
          {translate('habits:details.summary.kept', { count: totalKept, target: AUTOMATIC_DAYS })}
        </dd>
        <dd className="lm-habit-stats__detail">
          <span
            className="lm-habit-stats__bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={AUTOMATIC_DAYS}
            aria-valuenow={Math.min(totalKept, AUTOMATIC_DAYS)}
            aria-label={translate('habits:details.summary.automatic')}
          >
            <span className="lm-habit-stats__bar-fill" style={{ width: `${towardAutomatic * 100}%` }} />
          </span>
          <span>
            {totalKept >= AUTOMATIC_DAYS
              ? translate('habits:details.summary.automaticReached')
              : translate('habits:details.summary.automaticHint')}
          </span>
        </dd>
      </div>
    </dl>
  )
}

export default HabitStatsSummary
