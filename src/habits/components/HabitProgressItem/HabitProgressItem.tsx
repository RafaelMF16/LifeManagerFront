import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Icon from '../../../shared/components/Icon/Icon'
import IconButton from '../../../shared/components/IconButton/IconButton'
import Input from '../../../shared/components/Input/Input'
import type { HabitProgressEntryDto, HabitTargetDto, HabitTodayItemDto } from '../../types/HabitTodayDtos'
import { formatAmount, progressPercent, remaining } from '../../utils/habitProgress'
import { HABIT_TARGET_MAX_VALUE } from '../../validation/habitSchema'
import ProgressEntriesList from '../ProgressEntriesList/ProgressEntriesList'
import './HabitProgressItem.css'

/** Same as the check item's celebration. */
const CELEBRATION_MS = 700
const WHOLE_NUMBER_PATTERN = /^\d{1,6}$/

interface HabitProgressItemProps {
  /** A habit with a daily target (`item.target` set). */
  item: HabitTodayItemDto & { target: HabitTargetDto }
  onAdd: (value: number) => void
  onRemove: (entry: HabitProgressEntryDto) => void
  /** Like the check item's: yesterday's pending habit whose streak ends if the target isn't reached. */
  streakRisk?: 'unprotected' | 'protected'
}

/**
 * A measured habit of the day's checklist: the progress bar towards the target, a quick add of the habit's step, any
 * other amount, and "Complete" for what is left. Reaching the target celebrates like a check-in.
 */
function HabitProgressItem({ item, onAdd, onRemove, streakRisk }: HabitProgressItemProps) {
  const { t: translate, i18n } = useTranslation('habits')
  const { target } = item
  const weekly = item.frequencyType === 'TimesPerWeek'
  const amount = (value: number) => formatAmount(value, i18n.language)
  const left = remaining(item.progress, target.value)
  const amountText = translate('habits:today.progress.amount', {
    progress: amount(item.progress),
    target: amount(target.value),
    unit: target.unit,
  })
  const streakLabel = [
    translate(weekly ? 'habits:habits.list.streakWeeks' : 'habits:habits.list.streakDays', { count: item.currentStreak }),
    translate('habits:habits.list.record', { count: item.longestStreak }),
  ].join(' · ')
  const showRisk = streakRisk !== undefined && !item.done && item.currentStreak > 0

  const [celebration, setCelebration] = useState<{ key: number; coins: number } | null>(null)
  const timeoutRef = useRef<number | undefined>(undefined)
  const [customOpen, setCustomOpen] = useState(false)
  const [customValue, setCustomValue] = useState('')
  const [customError, setCustomError] = useState(false)

  useEffect(() => () => window.clearTimeout(timeoutRef.current), [])

  function add(value: number) {
    // Celebrated on the tap that reaches the target: the progress is optimistic, so the day turns done right away.
    if (!item.done && item.progress + value >= target.value) {
      window.clearTimeout(timeoutRef.current)
      setCelebration({ key: Date.now(), coins: item.coinsPreview })
      timeoutRef.current = window.setTimeout(() => setCelebration(null), CELEBRATION_MS)
    }
    onAdd(value)
  }

  function submitCustom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = customValue.trim()
    const value = Number(text)
    if (!WHOLE_NUMBER_PATTERN.test(text) || value < 1 || value > HABIT_TARGET_MAX_VALUE) {
      setCustomError(true)
      return
    }
    add(value)
    closeCustom()
  }

  function closeCustom() {
    setCustomOpen(false)
    setCustomValue('')
    setCustomError(false)
  }

  return (
    <div
      className={`lm-habit-progress${item.done ? ' lm-habit-progress--done' : ''}${celebration ? ' lm-habit-progress--celebrate' : ''}`}
    >
      {celebration && celebration.coins > 0 ? (
        <span key={celebration.key} className="lm-habit-progress__burst" aria-hidden="true">
          <Icon name="coins" size={14} />
          {translate('habits:today.item.coins', { count: celebration.coins })}
        </span>
      ) : null}

      <div className="lm-habit-progress__header">
        <span className="lm-habit-progress__box" aria-hidden="true">
          {item.done ? <Icon name="check" size={16} strokeWidth={2.5} /> : null}
        </span>

        <span className="lm-habit-progress__main">
          <span className="lm-habit-progress__name">{item.name}</span>
          {item.trigger ? <span className="lm-habit-progress__trigger">{item.trigger}</span> : null}
          {showRisk ? (
            <span className={`lm-habit-progress__risk lm-habit-progress__risk--${streakRisk}`}>
              <Icon name={streakRisk === 'protected' ? 'snowflake' : 'flame'} size={12} aria-hidden="true" />
              {streakRisk === 'protected'
                ? translate('habits:today.item.atRiskProtected')
                : translate(weekly ? 'habits:today.item.atRiskWeeks' : 'habits:today.item.atRiskDays', {
                    count: item.currentStreak,
                  })}
            </span>
          ) : null}
        </span>

        <span className="lm-habit-progress__side">
          <span
            className={`lm-habit-progress__streak${item.currentStreak > 0 ? ' lm-habit-progress__streak--on' : ''}`}
            title={streakLabel}
          >
            <Icon name="flame" size={14} aria-hidden="true" />
            <span aria-hidden="true">{item.currentStreak}</span>
            <span className="lm-habit-progress__visually-hidden">{streakLabel}</span>
          </span>
          {!item.done && item.coinsPreview > 0 ? (
            <span className="lm-habit-progress__coins">
              <Icon name="coins" size={12} aria-hidden="true" />
              {translate('habits:today.item.coins', { count: item.coinsPreview })}
            </span>
          ) : null}
        </span>
      </div>

      <div
        className="lm-habit-progress__bar"
        role="progressbar"
        aria-label={item.name}
        aria-valuemin={0}
        aria-valuemax={target.value}
        aria-valuenow={Math.min(item.progress, target.value)}
        aria-valuetext={amountText}
      >
        <span className="lm-habit-progress__fill" style={{ width: `${progressPercent(item.progress, target.value)}%` }} />
      </div>

      <div className="lm-habit-progress__footer">
        <span className="lm-habit-progress__amount">
          {amountText}
          <span className="lm-habit-progress__left">
            {item.done
              ? translate('habits:today.progress.done')
              : translate('habits:today.progress.remaining', { value: amount(left), unit: target.unit })}
          </span>
        </span>

        <span className="lm-habit-progress__actions">
          {target.step ? (
            <Button
              variant="secondary"
              size="sm"
              aria-label={translate('habits:today.progress.addLabel', { value: amount(target.step), unit: target.unit })}
              onClick={() => add(target.step!)}
            >
              {translate('habits:today.progress.addStep', { value: amount(target.step) })}
            </Button>
          ) : null}
          <IconButton
            icon="plus"
            size="sm"
            variant="secondary"
            label={translate('habits:today.progress.custom')}
            aria-expanded={customOpen}
            onClick={() => (customOpen ? closeCustom() : setCustomOpen(true))}
          />
          {!item.done && left > 0 ? (
            <Button
              variant="primary"
              size="sm"
              aria-label={translate('habits:today.progress.completeLabel', { value: amount(left), unit: target.unit })}
              onClick={() => add(left)}
            >
              {translate('habits:today.progress.complete')}
            </Button>
          ) : null}
        </span>
      </div>

      {customOpen ? (
        <form className="lm-habit-progress__custom" onSubmit={submitCustom} noValidate>
          <Input
            type="number"
            label={translate('habits:today.progress.customLabel', { unit: target.unit })}
            min={1}
            max={HABIT_TARGET_MAX_VALUE}
            inputMode="numeric"
            numeric
            autoFocus
            size="sm"
            value={customValue}
            onChange={(event) => {
              setCustomValue(event.target.value)
              setCustomError(false)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') closeCustom()
            }}
            error={customError ? translate('habits:today.progress.customInvalid') : undefined}
            containerClassName="lm-habit-progress__custom-field"
          />
          <Button type="submit" variant="primary" size="sm">
            {translate('habits:today.progress.customSubmit')}
          </Button>
        </form>
      ) : null}

      <ProgressEntriesList entries={item.entries} unit={target.unit} onRemove={onRemove} />
    </div>
  )
}

export default HabitProgressItem
