import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Icon from '../../../shared/components/Icon/Icon'
import { useBudgetMonth } from '../../hooks/useBudgetMonth'
import type { BudgetProgressDto, BudgetType } from '../../types/BudgetDtos'
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

/**
 * The month's goals at a glance, on the month details page: how many are on track and the ones closest to (or past)
 * their goal. Read-only; changing goals happens on the Planning screen.
 */
function MonthBudgetsSummary({ year, month, refreshKey }: MonthBudgetsSummaryProps) {
  const { t: translate } = useTranslation('finance')
  const yearMonth = formatYearMonth(year, month)
  const { data, status } = useBudgetMonth(yearMonth, refreshKey)

  // A side card: it stays out of the way while loading and if it fails, the page works without it.
  if (status !== 'ready' || !data) return null

  const goals: { type: BudgetType; item: BudgetProgressDto }[] = [
    ...[data.expenses.total, ...data.expenses.categories].flatMap((item) => (item ? [{ type: 'Expense' as const, item }] : [])),
    ...[data.investments.total, ...data.investments.categories].flatMap((item) => (item ? [{ type: 'Investment' as const, item }] : [])),
  ]
  const link = `/finance/planning/goals?month=${yearMonth}`

  if (goals.length === 0) {
    return (
      <section className="lm-month-budgets lm-month-budgets--empty" aria-label={translate('finance:budgets.summary.title')}>
        <span className="lm-month-budgets__empty-text">
          <Icon name="target" size={16} aria-hidden="true" />
          {translate('finance:budgets.summary.none')}
        </span>
        <Link to={link} className="lm-month-budgets__link">
          {translate('finance:budgets.summary.define')}
        </Link>
      </section>
    )
  }

  const onTrack = goals.filter((goal) => goal.item.achieved).length
  // Furthest along first: a limit about to be passed (or passed) matters more than one barely touched.
  const shown = [...goals].sort((first, second) => second.item.ratio - first.item.ratio).slice(0, MAX_SHOWN)

  return (
    <section className="lm-month-budgets" aria-labelledby="lm-month-budgets-title">
      <div className="lm-month-budgets__header">
        <div className="lm-month-budgets__heading">
          <h2 id="lm-month-budgets-title" className="lm-month-budgets__title">
            {translate('finance:budgets.summary.title')}
          </h2>
          <span className="lm-month-budgets__count">
            {translate('finance:budgets.summary.onTrack', { count: goals.length, achieved: onTrack })}
          </span>
        </div>
        <Link to={link} className="lm-month-budgets__link">
          {translate('finance:budgets.summary.seeAll')}
          <Icon name="chevron-right" size={12} aria-hidden="true" />
        </Link>
      </div>

      <ul className="lm-month-budgets__list">
        {shown.map((goal) => (
          <li key={goal.item.id}>
            <BudgetProgress
              type={goal.type}
              name={goal.item.categoryName ?? translate('finance:budgets.total')}
              goal={goal.item.goal}
              actual={goal.item.actual}
              ratio={goal.item.ratio}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

export default MonthBudgetsSummary
