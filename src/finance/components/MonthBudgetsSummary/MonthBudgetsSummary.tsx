import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Icon from '../../../shared/components/Icon/Icon'
import { useBudgetPlan } from '../../hooks/useBudgetPlan'
import type { BudgetSliceType } from '../../types/BudgetPlanDtos'
import { sliceKey } from '../../utils/budgetPlan'
import { formatYearMonth } from '../../utils/yearMonth'
import BudgetProgress from '../BudgetProgress/BudgetProgress'
import './MonthBudgetsSummary.css'

/** How many goals the card shows; the rest are one link away. */
const MAX_SHOWN = 3

interface MonthBudgetsSummaryProps {
  year: number
  month: number
  /** Bumped whenever the month's transactions change, so the actual amounts follow. */
  refreshKey: number
}

interface Goal {
  key: string
  type: BudgetSliceType
  name: string
  goal: number
  actual: number
  ratio: number
  achieved: boolean
}

/**
 * The month's budget at a glance, on the month details page: how many slices are on track and the ones closest to
 * (or past) their amount, the free part included. Read-only; the budget is changed on the Planning screen.
 */
function MonthBudgetsSummary({ year, month, refreshKey }: MonthBudgetsSummaryProps) {
  const { t: translate } = useTranslation('finance')
  const yearMonth = formatYearMonth(year, month)
  const { data, status } = useBudgetPlan(yearMonth, refreshKey)

  // A side card: it stays out of the way while loading and if it fails, the page works without it.
  if (status !== 'ready' || !data) return null

  const link = `/finance/planning/goals?month=${yearMonth}`

  if (!data.exists) {
    return (
      <section className="lm-month-budgets lm-month-budgets--empty" aria-label={translate('finance:budgetPlan.summary.title')}>
        <span className="lm-month-budgets__empty-text">
          <Icon name="target" size={16} aria-hidden="true" />
          {translate('finance:budgetPlan.summary.none')}
        </span>
        <Link to={link} className="lm-month-budgets__link">
          {translate('finance:budgetPlan.summary.define')}
        </Link>
      </section>
    )
  }

  const goals: Goal[] = data.slices.map((slice) => ({
    key: sliceKey(slice),
    type: slice.type,
    name: slice.type === 'Investment' ? translate('finance:budgetPlan.investment') : (slice.categoryName ?? ''),
    goal: slice.amount,
    actual: slice.actual,
    ratio: slice.ratio,
    achieved: slice.achieved,
  }))

  // The free part is a limit too: what was spent outside the slices.
  if (data.freeAmount !== null && data.freeAmount > 0) {
    goals.push({
      key: 'free',
      type: 'Expense',
      name: translate('finance:budgetPlan.summary.free'),
      goal: data.freeAmount,
      actual: data.freeActual,
      ratio: data.freeActual / data.freeAmount,
      achieved: data.freeActual <= data.freeAmount,
    })
  }

  const onTrack = goals.filter((goal) => goal.achieved).length
  // Furthest along first: a limit about to be passed (or passed) matters more than one barely touched.
  const shown = [...goals].sort((first, second) => second.ratio - first.ratio).slice(0, MAX_SHOWN)

  return (
    <section className="lm-month-budgets" aria-labelledby="lm-month-budgets-title">
      <div className="lm-month-budgets__header">
        <div className="lm-month-budgets__heading">
          <h2 id="lm-month-budgets-title" className="lm-month-budgets__title">
            {translate('finance:budgetPlan.summary.title')}
          </h2>
          {goals.length > 0 ? (
            <span className="lm-month-budgets__count">
              {translate('finance:budgetPlan.summary.onTrack', { count: goals.length, achieved: onTrack })}
            </span>
          ) : null}
        </div>
        <Link to={link} className="lm-month-budgets__link">
          {translate('finance:budgetPlan.summary.seeAll')}
          <Icon name="chevron-right" size={12} aria-hidden="true" />
        </Link>
      </div>

      <ul className="lm-month-budgets__list">
        {shown.map((goal) => (
          <li key={goal.key}>
            <BudgetProgress type={goal.type} name={goal.name} goal={goal.goal} actual={goal.actual} ratio={goal.ratio} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export default MonthBudgetsSummary
