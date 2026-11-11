import { useId, useState } from 'react'
import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { usePrivacyMode } from '../../../shared/hooks/usePrivacyMode'
import { useFinanceFormat } from '../../hooks/useFinanceFormat'
import type { SavingsGoalMonthDto } from '../../types/SavingsGoalDtos'
import { savingsChartBars } from '../../utils/savingsGoal'
import { parseYearMonth } from '../../utils/yearMonth'
import Amount from '../Amount/Amount'
import './SavingsGoalChart.css'

/** Gridlines at these fractions of the scale's top. */
const GRID_FRACTIONS = [1, 0.5, 0]

/** Hidden bars all get this length: their real lengths would give the amounts away. */
const HIDDEN_BAR_RATIO = 0.5

interface SavingsGoalChartProps {
  /** The last 12 months, the current one last. */
  monthly: SavingsGoalMonthDto[]
}

/**
 * What was saved towards the goal in each of the last 12 months, as columns in the investment color. Like the
 * dashboard's chart, nothing is hover-only: each month is a button that fills the detail line with its amount, and a
 * visually hidden table carries every value for screen readers.
 */
function SavingsGoalChart({ monthly }: SavingsGoalChartProps) {
  const { t: translate } = useTranslation('finance')
  const { compactMoney, periodLabel, shortMonthName } = useFinanceFormat()
  const { hidden } = usePrivacyMode()
  const titleId = useId()
  const { scaleMax, bars } = savingsChartBars(monthly)
  // The current month is the one people look for first.
  const [selectedIndex, setSelectedIndex] = useState(monthly.length - 1)
  const selected = bars[Math.min(selectedIndex, bars.length - 1)]

  function label(month: string) {
    const parsed = parseYearMonth(month)
    return parsed ? periodLabel(parsed.month, parsed.year) : month
  }

  function shortLabel(month: string) {
    const parsed = parseYearMonth(month)
    return parsed ? shortMonthName(parsed.month) : month
  }

  return (
    <section className={`lm-goal-chart${hidden ? ' lm-goal-chart--hidden' : ''}`} aria-labelledby={titleId}>
      <div className="lm-goal-chart__header">
        <h2 id={titleId} className="lm-goal-chart__title">
          {translate('finance:savingsGoals.details.chart.title')}
        </h2>
        <span className="lm-goal-chart__subtitle">{translate('finance:savingsGoals.details.chart.subtitle')}</span>
      </div>

      {selected ? (
        <div className="lm-goal-chart__detail" aria-live="polite">
          <span className="lm-goal-chart__detail-month">{label(selected.month)}</span>
          <Amount value={selected.amount} tone="investment" emphasis />
        </div>
      ) : null}

      <div className="lm-goal-chart__plot">
        <div className="lm-goal-chart__grid" aria-hidden="true">
          {GRID_FRACTIONS.map((fraction) => (
            <div key={fraction} className="lm-goal-chart__gridline" style={{ '--lm-bar': fraction } as CSSProperties}>
              <span className="lm-goal-chart__gridlabel lm-numeric">{compactMoney(scaleMax * fraction)}</span>
            </div>
          ))}
        </div>

        <div className="lm-goal-chart__columns">
          {bars.map((bar, index) => {
            const isSelected = index === selectedIndex
            const ratio = hidden ? HIDDEN_BAR_RATIO : bar.ratio
            return (
              <button
                key={bar.month}
                type="button"
                className={`lm-goal-chart__column${isSelected ? ' lm-goal-chart__column--selected' : ''}`}
                aria-pressed={isSelected}
                aria-label={label(bar.month)}
                onClick={() => setSelectedIndex(index)}
                onFocus={() => setSelectedIndex(index)}
                onPointerEnter={(event) => {
                  // Mouse hover previews a month; touch selects on tap through onClick.
                  if (event.pointerType === 'mouse') setSelectedIndex(index)
                }}
              >
                <span className="lm-goal-chart__slot" aria-hidden="true">
                  <span
                    className={`lm-goal-chart__bar${bar.amount <= 0 && !hidden ? ' lm-goal-chart__bar--empty' : ''}`}
                    style={{ '--lm-bar': ratio } as CSSProperties}
                  />
                </span>
                <span className="lm-goal-chart__month" aria-hidden="true">
                  {shortLabel(bar.month)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <p className="lm-goal-chart__hint">{translate('finance:savingsGoals.details.chart.selectHint')}</p>

      <div className="lm-goal-chart__table">
        <table>
          <caption>{translate('finance:savingsGoals.details.chart.tableCaption')}</caption>
          <thead>
            <tr>
              <th scope="col">{translate('finance:savingsGoals.details.chart.month')}</th>
              <th scope="col">{translate('finance:savingsGoals.details.chart.amount')}</th>
            </tr>
          </thead>
          <tbody>
            {bars.map((bar) => (
              <tr key={bar.month}>
                <th scope="row">{label(bar.month)}</th>
                <td>
                  <Amount value={bar.amount} tone="investment" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default SavingsGoalChart
