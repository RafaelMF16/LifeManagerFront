import { useTranslation } from 'react-i18next'
import Icon from '../../../shared/components/Icon/Icon'
import type { HabitTodayItemDto } from '../../types/HabitTodayDtos'
import './HabitCheckItem.css'

interface HabitCheckItemProps {
  item: HabitTodayItemDto
  /** While its check-in is being saved: further taps are ignored. */
  pending: boolean
  onToggle: () => void
}

/**
 * One habit of the day's checklist. The whole row is the button (a large tap target on phones); tapping a done
 * habit undoes it.
 */
function HabitCheckItem({ item, pending, onToggle }: HabitCheckItemProps) {
  const { t: translate } = useTranslation('habits')
  const weekly = item.frequencyType === 'TimesPerWeek'
  const streakLabel = translate(weekly ? 'habits:habits.list.streakWeeks' : 'habits:habits.list.streakDays', {
    count: item.currentStreak,
  })

  return (
    <button
      type="button"
      aria-pressed={item.done}
      aria-busy={pending}
      className={`lm-habit-check${item.done ? ' lm-habit-check--done' : ''}`}
      onClick={onToggle}
    >
      <span className="lm-habit-check__box" aria-hidden="true">
        {item.done ? <Icon name="check" size={16} strokeWidth={2.5} /> : null}
      </span>

      <span className="lm-habit-check__main">
        <span className="lm-habit-check__name">{item.name}</span>
        <span className="lm-habit-check__meta">
          {weekly && item.timesPerWeek ? (
            <span className="lm-habit-check__week">
              {translate('habits:today.item.week', { done: item.weekDoneCount ?? 0, target: item.timesPerWeek })}
            </span>
          ) : null}
          {item.trigger ? <span className="lm-habit-check__trigger">{item.trigger}</span> : null}
        </span>
      </span>

      <span className="lm-habit-check__side">
        <span
          className={`lm-habit-check__streak${item.currentStreak > 0 ? ' lm-habit-check__streak--on' : ''}`}
          title={streakLabel}
        >
          <Icon name="flame" size={14} aria-hidden="true" />
          <span aria-hidden="true">{item.currentStreak}</span>
          <span className="lm-habit-check__visually-hidden">{streakLabel}</span>
        </span>
        {!item.done && item.coinsPreview > 0 ? (
          <span className="lm-habit-check__coins">
            <Icon name="coins" size={12} aria-hidden="true" />
            {translate('habits:today.item.coins', { count: item.coinsPreview })}
          </span>
        ) : null}
      </span>
    </button>
  )
}

export default HabitCheckItem
