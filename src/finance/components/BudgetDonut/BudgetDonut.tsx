import { useId, useState } from 'react'
import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { useFinanceFormat } from '../../hooks/useFinanceFormat'
import { usePrivacyMode } from '../../hooks/usePrivacyMode'
import { donutArcPath, donutSegments } from '../../utils/donutGeometry'
import './BudgetDonut.css'

/** The key of the free part, selectable like a slice. */
export const FREE_KEY = 'free'

export interface DonutSlice {
  key: string
  label: string
  percent: number
  amount: number
  /** A CSS color, e.g. `var(--chart-slice-1)`. */
  color: string
}

interface BudgetDonutProps {
  /** The plan's slices in list order; the free part is drawn after them. */
  slices: DonutSlice[]
  freePercent: number
  /** Null while the month has no total. */
  freeAmount: number | null
  selectedKey: string | null
  onSelect: (key: string) => void
}

const CENTER = 100
const OUTER_RADIUS = 96
const INNER_RADIUS = 66

/**
 * The month's budget as a ring that fills up to 100%: one segment per slice and a hatched free part. Hovering or
 * tapping a segment shows it in the middle; tapping also selects its row. In privacy mode every segment is the same
 * size and color, since the sizes would give the proportions away.
 */
function BudgetDonut({ slices, freePercent, freeAmount, selectedKey, onSelect }: BudgetDonutProps) {
  const { t: translate } = useTranslation('finance')
  const { money, sharePercent } = useFinanceFormat()
  const { hidden } = usePrivacyMode()
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const hatchId = `lm-budget-donut-hatch-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`

  const freeLabel = translate('finance:budgetPlan.free')
  const parts = [...slices, { key: FREE_KEY, label: freeLabel, percent: freePercent, amount: freeAmount ?? 0, color: `url(#${hatchId})` }]
  const shares = hidden ? parts.map(() => 100 / parts.length) : parts.map((part) => part.percent)
  const segments = donutSegments(shares)

  const shownKey = hoveredKey ?? selectedKey
  const shown = parts.find((part) => part.key === shownKey) ?? null
  const allocated = 100 - freePercent

  const description = translate('finance:budgetPlan.chart.label', {
    allocated: sharePercent(allocated),
    parts: parts.map((part) => `${part.label} ${sharePercent(part.percent)}`).join(', '),
  })

  return (
    <div className={`lm-budget-donut${hidden ? ' lm-budget-donut--hidden' : ''}`}>
      <svg className="lm-budget-donut__chart" viewBox="-6 -6 212 212" role="img" aria-label={description}>
        <defs>
          <pattern id={hatchId} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect className="lm-budget-donut__hatch-ground" width="6" height="6" />
            <line className="lm-budget-donut__hatch-line" x1="0" y1="0" x2="0" y2="6" />
          </pattern>
        </defs>
        {parts.map((part, index) => {
          const { startAngle, endAngle } = segments[index]
          const path = donutArcPath(CENTER, CENTER, OUTER_RADIUS, INNER_RADIUS, startAngle, endAngle)
          if (!path) return null

          return (
            <path
              key={part.key}
              d={path}
              fillRule="evenodd"
              className={`lm-budget-donut__segment${part.key === selectedKey ? ' lm-budget-donut__segment--selected' : ''}`}
              style={{ '--lm-segment-color': part.color } as CSSProperties}
              onPointerEnter={() => setHoveredKey(part.key)}
              onPointerLeave={() => setHoveredKey((key) => (key === part.key ? null : key))}
              onClick={() => onSelect(part.key)}
            />
          )
        })}
      </svg>

      {/* Read from the rows next to it by screen readers; the chart's label already sums it up. */}
      <div className="lm-budget-donut__center" aria-hidden="true">
        {shown ? (
          <>
            <span className="lm-budget-donut__center-label">{shown.label}</span>
            <span className="lm-budget-donut__center-value lm-numeric">{sharePercent(shown.percent)}</span>
            <span className="lm-budget-donut__center-detail lm-numeric">{money(shown.amount)}</span>
          </>
        ) : (
          <>
            <span className="lm-budget-donut__center-value lm-numeric">{sharePercent(allocated)}</span>
            <span className="lm-budget-donut__center-label">{translate('finance:budgetPlan.chart.allocated')}</span>
            {freeAmount !== null ? (
              <span className="lm-budget-donut__center-detail lm-numeric">
                {translate('finance:budgetPlan.chart.free', { amount: money(freeAmount) })}
              </span>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

export default BudgetDonut
