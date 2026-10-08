import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Icon from '../../../shared/components/Icon/Icon'
import type { HabitAvoidItemDto } from '../../types/HabitTodayDtos'
import './HabitAvoidCard.css'

export type RelapseDay = 'today' | 'yesterday'

interface HabitAvoidCardProps {
  item: HabitAvoidItemDto
  /** While a relapse (or its undo) is being saved. */
  pending: boolean
  /** Opens the confirmation; shown while today or yesterday can still take a relapse. */
  onRelapse: () => void
  onUndo: (day: RelapseDay) => void
}

/** A habit to avoid on the day's checklist: the clean streak, the weekly limit, and the relapse button. */
function HabitAvoidCard({ item, pending, onRelapse, onUndo }: HabitAvoidCardProps) {
  const { t: translate } = useTranslation('habits')
  const weekly = item.frequencyType === 'TimesPerWeek'
  const canRelapse = !item.relapsedToday || item.canRelapseYesterday

  return (
    <article className={`lm-habit-avoid${item.relapsedToday ? ' lm-habit-avoid--relapsed' : ''}`} aria-busy={pending}>
      <div className="lm-habit-avoid__main">
        <span className="lm-habit-avoid__name">{item.name}</span>
        {item.trigger ? <span className="lm-habit-avoid__trigger">{item.trigger}</span> : null}
        <span className="lm-habit-avoid__meta">
          <span className={`lm-habit-avoid__streak${item.currentStreak > 0 ? ' lm-habit-avoid__streak--on' : ''}`}>
            <Icon name="flame" size={14} aria-hidden="true" />
            {translate(weekly ? 'habits:today.avoid.streakWeeks' : 'habits:today.avoid.streakDays', { count: item.currentStreak })}
          </span>
          {item.longestStreak > 0 ? (
            <span className="lm-habit-avoid__record">{translate('habits:habits.list.record', { count: item.longestStreak })}</span>
          ) : null}
          {weekly && item.timesPerWeek ? (
            <span className="lm-habit-avoid__limit">
              {translate('habits:today.avoid.weekLimit', { count: item.weekRelapseCount ?? 0, limit: item.timesPerWeek })}
            </span>
          ) : null}
        </span>
      </div>

      <div className="lm-habit-avoid__actions">
        {item.relapsedToday ? (
          <span className="lm-habit-avoid__logged">
            {translate('habits:today.avoid.loggedToday')}
            <Button variant="ghost" size="sm" disabled={pending} onClick={() => onUndo('today')}>
              {translate('habits:today.avoid.undo')}
            </Button>
          </span>
        ) : null}
        {item.relapsedYesterday ? (
          <span className="lm-habit-avoid__logged">
            {translate('habits:today.avoid.loggedYesterday')}
            <Button variant="ghost" size="sm" disabled={pending} onClick={() => onUndo('yesterday')}>
              {translate('habits:today.avoid.undo')}
            </Button>
          </span>
        ) : null}
        {canRelapse ? (
          <Button variant="secondary" loading={pending} onClick={onRelapse} className="lm-habit-avoid__relapse">
            {translate('habits:today.avoid.relapse')}
          </Button>
        ) : null}
      </div>
    </article>
  )
}

export default HabitAvoidCard
