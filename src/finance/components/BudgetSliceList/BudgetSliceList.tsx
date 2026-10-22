import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { useFinanceFormat } from '../../hooks/useFinanceFormat'
import { usePrivacyMode } from '../../hooks/usePrivacyMode'
import type { BudgetSliceType } from '../../types/BudgetPlanDtos'
import { budgetStatus } from '../../utils/budgetStatus'
import { FREE_KEY } from '../BudgetDonut/BudgetDonut'
import './BudgetSliceList.css'

/** Hidden bars all get this length: their real lengths would give the proportions away. */
const HIDDEN_BAR_RATIO = 0.5

export interface SliceRow {
  key: string
  type: BudgetSliceType
  name: string
  percent: number
  amount: number
  /** A CSS color, the same as the slice's segment in the donut. */
  color: string
  /** What was spent or invested; null for a slice that isn't saved yet. */
  actual: number | null
  /** Actual / amount; null when there is nothing to compare with. */
  ratio: number | null
  /** How far the slider may go: the slice's share plus what is free. */
  max: number
}

interface BudgetSliceListProps {
  rows: SliceRow[]
  free: { percent: number; amount: number | null; actual: number }
  selectedKey: string | null
  onSelect: (key: string) => void
  /** Omitted for a read-only list. */
  onPercentChange?: (key: string, percent: number) => void
  /** Sliders shown but locked (privacy mode). */
  locked?: boolean
}

/**
 * The month's slices beside the donut: each with its share, its amount and how the month is going against it,
 * and the free part last, against what was spent outside the slices.
 */
function BudgetSliceList({ rows, free, selectedKey, onSelect, onPercentChange, locked = false }: BudgetSliceListProps) {
  const { t: translate } = useTranslation('finance')
  const { money, sharePercent } = useFinanceFormat()
  const { hidden } = usePrivacyMode()
  const itemRefs = useRef(new Map<string, HTMLLIElement>())

  // A segment tapped in the donut brings its row into view (a no-op when it already is).
  useEffect(() => {
    if (selectedKey) itemRefs.current.get(selectedKey)?.scrollIntoView({ block: 'nearest' })
  }, [selectedKey])

  function setItemRef(key: string) {
    return (element: HTMLLIElement | null) => {
      if (element) itemRefs.current.set(key, element)
      else itemRefs.current.delete(key)
    }
  }

  function renderProgress(type: BudgetSliceType, text: string, ratio: number | null) {
    if (ratio === null) return <p className="lm-budget-slice__pending">{text}</p>

    const status = budgetStatus(type, ratio)
    const barStyle = { '--lm-bar': hidden ? HIDDEN_BAR_RATIO : Math.min(Math.max(ratio, 0), 1) } as CSSProperties

    // Privacy mode: neutral, same-length bars and no status, which would tell over from under.
    return (
      <div className={`lm-budget-slice__progress lm-budget-slice__progress--${hidden ? 'hidden' : status}`}>
        <span className="lm-budget-slice__track" aria-hidden="true">
          <span className="lm-budget-slice__fill" style={barStyle} />
        </span>
        <span className="lm-budget-slice__progress-text lm-numeric">
          {text}
          {hidden ? null : (
            <span className="lm-budget-slice__status">
              <span className="lm-budget-slice__status-dot" aria-hidden="true" />
              {translate(`finance:budgetPlan.status.${status}`)}
            </span>
          )}
        </span>
      </div>
    )
  }

  function renderHead(key: string, name: string, percent: number, amount: number | null, color: string) {
    return (
      <button
        type="button"
        className="lm-budget-slice__head"
        aria-pressed={key === selectedKey}
        onClick={() => onSelect(key)}
      >
        <span className="lm-budget-slice__swatch" style={{ '--lm-slice-color': color } as CSSProperties} aria-hidden="true" />
        <span className="lm-budget-slice__name">{name}</span>
        <span className="lm-budget-slice__percent lm-numeric">{sharePercent(percent)}</span>
        {amount !== null ? <span className="lm-budget-slice__amount lm-numeric">{money(amount)}</span> : null}
      </button>
    )
  }

  const freeRatio = free.amount === null ? null : free.amount > 0 ? free.actual / free.amount : free.actual > 0 ? Infinity : 0

  return (
    <ul className="lm-budget-slices" aria-label={translate('finance:budgetPlan.slicesLabel')}>
      {rows.map((row) => (
        <li
          key={row.key}
          ref={setItemRef(row.key)}
          className={`lm-budget-slice${row.key === selectedKey ? ' lm-budget-slice--selected' : ''}`}
        >
          {renderHead(row.key, row.name, row.percent, row.amount, row.color)}
          {onPercentChange ? (
            // Every slider spans 0–100%, so the same share sits at the same place on every row; the track shows
            // how far this one may still go, and the value stops there.
            <input
              type="range"
              className="lm-budget-slice__slider"
              min={0}
              max={100}
              step={1}
              value={row.percent}
              disabled={locked}
              aria-label={translate('finance:budgetPlan.slider.label', { name: row.name })}
              aria-valuetext={translate('finance:budgetPlan.slider.valueText', {
                name: row.name,
                percent: sharePercent(row.percent),
                amount: money(row.amount),
              })}
              style={{ '--lm-slice-color': row.color, '--lm-value': row.percent, '--lm-max': row.max } as CSSProperties}
              onChange={(event) => onPercentChange(row.key, Number(event.target.value))}
              onFocus={() => onSelect(row.key)}
            />
          ) : null}
          {renderProgress(
            row.type,
            row.actual === null
              ? translate('finance:budgetPlan.progress.notSaved')
              : translate(`finance:budgetPlan.progress.${row.type}`, { actual: money(row.actual), amount: money(row.amount) }),
            row.actual === null ? null : row.ratio,
          )}
        </li>
      ))}

      <li ref={setItemRef(FREE_KEY)} className={`lm-budget-slice lm-budget-slice--free${selectedKey === FREE_KEY ? ' lm-budget-slice--selected' : ''}`}>
        {renderHead(FREE_KEY, translate('finance:budgetPlan.free'), free.percent, free.amount, 'transparent')}
        {free.amount !== null
          ? renderProgress(
              'Expense',
              translate('finance:budgetPlan.progress.unsliced', { actual: money(free.actual), amount: money(free.amount) }),
              freeRatio,
            )
          : null}
      </li>
    </ul>
  )
}

export default BudgetSliceList
