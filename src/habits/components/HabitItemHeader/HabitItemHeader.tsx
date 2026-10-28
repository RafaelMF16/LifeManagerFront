import { useTranslation } from 'react-i18next'
import Icon from '../../../shared/components/Icon/Icon'
import type { Celebration } from '../../hooks/useCelebration'
import type { HabitTodayItemDto } from '../../types/HabitTodayDtos'
import './HabitItemHeader.css'

interface HabitItemHeaderProps {
  item: HabitTodayItemDto
  /**
   * Yesterday's pending habit whose streak ends if it isn't done: `protected` when the player holds a streak freeze
   * that would cover it.
   */
  streakRisk?: 'unprotected' | 'protected'
  celebration: Celebration | null
}

/**
 * What every habit of the day's checklist shows, one-tap or measured: the done box, the name with the week's count,
 * the cue and the streak at risk, then the streak and the coins it would earn. Only spans, so it fits inside a button.
 * The coins a check-in earned float up from the card, which must be `position: relative`.
 */
function HabitItemHeader({ item, streakRisk, celebration }: HabitItemHeaderProps) {
  const { t: translate } = useTranslation('habits')
  const weekly = item.frequencyType === 'TimesPerWeek'
  const streakLabel = [
    translate(weekly ? 'habits:habits.list.streakWeeks' : 'habits:habits.list.streakDays', { count: item.currentStreak }),
    translate('habits:habits.list.record', { count: item.longestStreak }),
  ].join(' · ')
  const showRisk = streakRisk !== undefined && !item.done && item.currentStreak > 0

  return (
    <span
      className={`lm-habit-item${item.done ? ' lm-habit-item--done' : ''}${celebration ? ' lm-habit-item--celebrate' : ''}`}
    >
      {celebration && celebration.coins > 0 ? (
        <span key={celebration.key} className="lm-habit-item__burst" aria-hidden="true">
          <Icon name="coins" size={14} />
          {translate('habits:today.item.coins', { count: celebration.coins })}
        </span>
      ) : null}
      <span className="lm-habit-item__box" aria-hidden="true">
        {item.done ? <Icon name="check" size={16} strokeWidth={2.5} /> : null}
      </span>

      <span className="lm-habit-item__main">
        <span className="lm-habit-item__name">{item.name}</span>
        <span className="lm-habit-item__meta">
          {weekly && item.timesPerWeek ? (
            <span className="lm-habit-item__week">
              {translate('habits:today.item.week', { done: item.weekDoneCount ?? 0, target: item.timesPerWeek })}
            </span>
          ) : null}
          {item.trigger ? <span className="lm-habit-item__trigger">{item.trigger}</span> : null}
        </span>
        {showRisk ? (
          <span className={`lm-habit-item__risk lm-habit-item__risk--${streakRisk}`}>
            <Icon name={streakRisk === 'protected' ? 'snowflake' : 'flame'} size={12} aria-hidden="true" />
            {streakRisk === 'protected'
              ? translate('habits:today.item.atRiskProtected')
              : translate(weekly ? 'habits:today.item.atRiskWeeks' : 'habits:today.item.atRiskDays', { count: item.currentStreak })}
          </span>
        ) : null}
      </span>

      <span className="lm-habit-item__side">
        <span className={`lm-habit-item__streak${item.currentStreak > 0 ? ' lm-habit-item__streak--on' : ''}`} title={streakLabel}>
          <Icon name="flame" size={14} aria-hidden="true" />
          <span aria-hidden="true">{item.currentStreak}</span>
          <span className="lm-habit-item__visually-hidden">{streakLabel}</span>
        </span>
        {!item.done && item.coinsPreview > 0 ? (
          <span className="lm-habit-item__coins">
            <Icon name="coins" size={12} aria-hidden="true" />
            {translate('habits:today.item.coins', { count: item.coinsPreview })}
          </span>
        ) : null}
      </span>
    </span>
  )
}

export default HabitItemHeader
