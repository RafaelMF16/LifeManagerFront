import { useId, useState } from 'react'
import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { useFinanceFormat } from '../../hooks/useFinanceFormat'
import { usePrivacyMode } from '../../hooks/usePrivacyMode'
import type { DashboardBudgetMonthDto, DashboardMonthDto } from '../../types/DashboardDtos'
import { barRatio, niceMax } from '../../utils/chartScale'
import Amount from '../Amount/Amount'
import './MonthlyFlowChart.css'

type Series = 'income' | 'investment' | 'expense'

// Fixed order, validated as a palette: violet between green and red keeps them apart for red–green colour
// blindness. Labels reuse the totals' keys (`finance:dashboard.totals.${id}`).
const SERIES: { id: Series; tone: 'positive' | 'investment' | 'negative' }[] = [
  { id: 'income', tone: 'positive' },
  { id: 'investment', tone: 'investment' },
  { id: 'expense', tone: 'negative' },
]

/** Gridlines at these fractions of the scale's top. */
const GRID_FRACTIONS = [1, 0.5, 0]

/** Above this many months the per-column labels would collide, so only every n-th month is named. */
const MAX_LABELLED_MONTHS = 12

/** Hidden bars all get this length: their real lengths would give the proportions away. */
const HIDDEN_BAR_RATIO = 0.5

/** The series that can carry a month-total goal, and where it is in a goal row. */
const GOAL_SERIES: Partial<Record<Series, 'expenseGoal' | 'investmentGoal'>> = {
  expense: 'expenseGoal',
  investment: 'investmentGoal',
}

interface MonthlyFlowChartProps {
  months: DashboardMonthDto[]
  /** The months' total goals, in the same order as `months`; drawn as a marker on their bars. */
  goals?: DashboardBudgetMonthDto[]
}

/**
 * Income, investment and expenses per month as grouped bars (columns on wide screens, rows on compact ones).
 * No hover-only information: each month is a button that fills the detail strip with its exact figures, and a
 * visually hidden table carries every value for screen readers.
 */
function MonthlyFlowChart({ months, goals = [] }: MonthlyFlowChartProps) {
  const { t: translate } = useTranslation('finance')
  const { compactMoney, periodLabel, shortMonthName } = useFinanceFormat()
  const { hidden } = usePrivacyMode()
  const titleId = useId()
  // The newest month is the one people look for first.
  const [selectedIndex, setSelectedIndex] = useState(months.length - 1)

  const selectedPosition = Math.min(selectedIndex, months.length - 1)
  const selected = months[selectedPosition]
  const selectedGoals = goals[selectedPosition]
  const hasGoals = goals.some((goal) => goal.expenseGoal !== null || goal.investmentGoal !== null)
  // Goals are part of the scale, so a marker above every bar still fits the plot.
  const scaleMax = niceMax(
    Math.max(
      0,
      ...months.flatMap((month) => [month.income, month.investment, month.expense]),
      ...goals.flatMap((goal) => [goal.expenseGoal ?? 0, goal.investmentGoal ?? 0]),
    ),
  )
  const labelEvery = Math.ceil(months.length / MAX_LABELLED_MONTHS)
  const showsBalanceRow = months.length <= MAX_LABELLED_MONTHS

  function barStyle(value: number): CSSProperties {
    const ratio = hidden ? HIDDEN_BAR_RATIO : barRatio(value, scaleMax)
    return { '--lm-bar': ratio } as CSSProperties
  }

  /** The month's goal on the series' bar, if it has one; markers stay hidden in privacy mode, like the real lengths. */
  function goalOf(index: number, series: Series) {
    const key = GOAL_SERIES[series]
    return key ? (goals[index]?.[key] ?? null) : null
  }

  function renderGoalCell(goal: number | null, tone: 'negative' | 'investment') {
    return goal === null ? translate('finance:dashboard.evolution.noGoal') : <Amount value={goal} tone={tone} />
  }

  return (
    <section
      className={`lm-flow-chart${hidden ? ' lm-flow-chart--hidden' : ''}`}
      aria-labelledby={titleId}
    >
      <div className="lm-flow-chart__header">
        <h2 id={titleId} className="lm-flow-chart__title">
          {translate('finance:dashboard.evolution.title')}
        </h2>
        <ul className="lm-flow-chart__legend" aria-label={translate('finance:dashboard.evolution.legendLabel')}>
          {SERIES.map((series) => (
            <li key={series.id} className="lm-flow-chart__legend-item">
              <span className={`lm-flow-chart__swatch lm-flow-chart__swatch--${series.id}`} aria-hidden="true" />
              {translate(`finance:dashboard.totals.${series.id}`)}
            </li>
          ))}
          {hasGoals && !hidden ? (
            <li className="lm-flow-chart__legend-item">
              <span className="lm-flow-chart__goal-swatch" aria-hidden="true" />
              {translate('finance:dashboard.evolution.goal')}
            </li>
          ) : null}
        </ul>
      </div>

      {selected ? (
        <div className="lm-flow-chart__detail" aria-live="polite">
          <span className="lm-flow-chart__detail-month">{periodLabel(selected.month, selected.year)}</span>
          <dl className="lm-flow-chart__detail-figures">
            {SERIES.map((series) => (
              <div key={series.id} className="lm-flow-chart__detail-figure">
                <dt>
                  <span className={`lm-flow-chart__swatch lm-flow-chart__swatch--${series.id}`} aria-hidden="true" />
                  {translate(`finance:dashboard.totals.${series.id}`)}
                </dt>
                <dd>
                  <Amount value={selected[series.id]} tone={series.tone} />
                </dd>
              </div>
            ))}
            <div className="lm-flow-chart__detail-figure">
              <dt>{translate('finance:dashboard.evolution.balance')}</dt>
              <dd>
                <Amount value={selected.balance} tone="signed" emphasis />
              </dd>
            </div>
            {selectedGoals?.expenseGoal != null ? (
              <div className="lm-flow-chart__detail-figure">
                <dt>{translate('finance:dashboard.evolution.expenseGoal')}</dt>
                <dd>
                  <Amount value={selectedGoals.expenseGoal} tone="negative" />
                </dd>
              </div>
            ) : null}
            {selectedGoals?.investmentGoal != null ? (
              <div className="lm-flow-chart__detail-figure">
                <dt>{translate('finance:dashboard.evolution.investmentGoal')}</dt>
                <dd>
                  <Amount value={selectedGoals.investmentGoal} tone="investment" />
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : null}

      <div className="lm-flow-chart__plot">
        <div className="lm-flow-chart__grid" aria-hidden="true">
          {GRID_FRACTIONS.map((fraction) => (
            <div key={fraction} className="lm-flow-chart__gridline" style={{ '--lm-bar': fraction } as CSSProperties}>
              <span className="lm-flow-chart__gridlabel lm-numeric">{compactMoney(scaleMax * fraction)}</span>
            </div>
          ))}
        </div>

        <div className="lm-flow-chart__groups">
          {months.map((month, index) => {
            const isSelected = index === selectedIndex
            const showsLabel = index % labelEvery === 0 || isSelected
            return (
              <button
                key={`${month.year}-${month.month}`}
                type="button"
                className={`lm-flow-chart__group${isSelected ? ' lm-flow-chart__group--selected' : ''}`}
                aria-pressed={isSelected}
                aria-label={periodLabel(month.month, month.year)}
                onClick={() => setSelectedIndex(index)}
                onFocus={() => setSelectedIndex(index)}
                onPointerEnter={(event) => {
                  // Mouse hover previews a month; touch selects on tap through onClick.
                  if (event.pointerType === 'mouse') setSelectedIndex(index)
                }}
              >
                <span className="lm-flow-chart__bars" aria-hidden="true">
                  {SERIES.map((series) => {
                    const goal = hidden ? null : goalOf(index, series.id)
                    return (
                      <span key={series.id} className="lm-flow-chart__slot">
                        <span
                          className={`lm-flow-chart__bar lm-flow-chart__bar--${series.id}${month[series.id] === 0 && !hidden ? ' lm-flow-chart__bar--empty' : ''}`}
                          style={barStyle(month[series.id])}
                        />
                        {goal !== null ? (
                          <span
                            className="lm-flow-chart__goal"
                            style={{ '--lm-goal': barRatio(goal, scaleMax) } as CSSProperties}
                          />
                        ) : null}
                      </span>
                    )
                  })}
                </span>
                <span
                  className={`lm-flow-chart__month${showsLabel ? '' : ' lm-flow-chart__month--quiet'}`}
                  aria-hidden="true"
                >
                  {shortMonthName(month.month)}
                </span>
                {showsBalanceRow ? (
                  <span className="lm-flow-chart__balance" aria-hidden="true">
                    <Amount value={month.balance} tone="signed" notation="compact" />
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      <p className="lm-flow-chart__hint">{translate('finance:dashboard.evolution.selectHint')}</p>

      <table className="lm-flow-chart__table">
        <caption>{translate('finance:dashboard.evolution.tableCaption')}</caption>
        <thead>
          <tr>
            <th scope="col">{translate('finance:dashboard.evolution.month')}</th>
            {SERIES.map((series) => (
              <th key={series.id} scope="col">
                {translate(`finance:dashboard.totals.${series.id}`)}
              </th>
            ))}
            <th scope="col">{translate('finance:dashboard.evolution.balance')}</th>
            {hasGoals ? (
              <>
                <th scope="col">{translate('finance:dashboard.evolution.expenseGoal')}</th>
                <th scope="col">{translate('finance:dashboard.evolution.investmentGoal')}</th>
              </>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {months.map((month, index) => (
            <tr key={`${month.year}-${month.month}`}>
              <th scope="row">{periodLabel(month.month, month.year)}</th>
              {SERIES.map((series) => (
                <td key={series.id}>
                  <Amount value={month[series.id]} tone={series.tone} />
                </td>
              ))}
              <td>
                <Amount value={month.balance} tone="signed" />
              </td>
              {hasGoals ? (
                <>
                  <td>{renderGoalCell(goals[index]?.expenseGoal ?? null, 'negative')}</td>
                  <td>{renderGoalCell(goals[index]?.investmentGoal ?? null, 'investment')}</td>
                </>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default MonthlyFlowChart
