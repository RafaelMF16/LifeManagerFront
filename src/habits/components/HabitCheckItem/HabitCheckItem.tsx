import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Icon from '../../../shared/components/Icon/Icon'
import type { HabitTodayItemDto } from '../../types/HabitTodayDtos'
import './HabitCheckItem.css'

/** How long the check-in celebration (the box's pop and the floating coins) stays on. */
const CELEBRATION_MS = 700

interface HabitCheckItemProps {
  item: HabitTodayItemDto
  /** While its check-in is being saved: further taps are ignored. */
  pending: boolean
  onToggle: () => void
  /**
   * Yesterday's pending habit whose streak ends if it isn't checked in: `protected` when the player holds a streak
   * freeze that would cover it.
   */
  streakRisk?: 'unprotected' | 'protected'
}

/**
 * One habit of the day's checklist. The whole row is the button (a large tap target on phones); tapping a done
 * habit undoes it.
 */
function HabitCheckItem({ item, pending, onToggle, streakRisk }: HabitCheckItemProps) {
  const { t: translate } = useTranslation('habits')
  const weekly = item.frequencyType === 'TimesPerWeek'
  const streakLabel = [
    translate(weekly ? 'habits:habits.list.streakWeeks' : 'habits:habits.list.streakDays', { count: item.currentStreak }),
    translate('habits:habits.list.record', { count: item.longestStreak }),
  ].join(' · ')
  const showRisk = streakRisk !== undefined && !item.done && item.currentStreak > 0
  // Each check-in gets its own key, so a quick undo and redo replays the animation.
  const [celebration, setCelebration] = useState<{ key: number; coins: number } | null>(null)
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timeoutRef.current), [])

  function handleClick() {
    // Celebrated on the tap itself: the check-in is optimistic, so the box turns done right away too.
    if (!item.done && !pending) {
      window.clearTimeout(timeoutRef.current)
      setCelebration({ key: Date.now(), coins: item.coinsPreview })
      timeoutRef.current = window.setTimeout(() => setCelebration(null), CELEBRATION_MS)
    }
    onToggle()
  }

  return (
    <button
      type="button"
      aria-pressed={item.done}
      aria-busy={pending}
      className={`lm-habit-check${item.done ? ' lm-habit-check--done' : ''}${celebration ? ' lm-habit-check--celebrate' : ''}`}
      onClick={handleClick}
    >
      {celebration && celebration.coins > 0 ? (
        <span key={celebration.key} className="lm-habit-check__burst" aria-hidden="true">
          <Icon name="coins" size={14} />
          {translate('habits:today.item.coins', { count: celebration.coins })}
        </span>
      ) : null}
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
        {showRisk ? (
          <span className={`lm-habit-check__risk lm-habit-check__risk--${streakRisk}`}>
            <Icon name={streakRisk === 'protected' ? 'snowflake' : 'flame'} size={12} aria-hidden="true" />
            {streakRisk === 'protected'
              ? translate('habits:today.item.atRiskProtected')
              : translate(weekly ? 'habits:today.item.atRiskWeeks' : 'habits:today.item.atRiskDays', { count: item.currentStreak })}
          </span>
        ) : null}
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
