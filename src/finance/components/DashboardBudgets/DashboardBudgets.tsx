import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Icon from '../../../shared/components/Icon/Icon'
import { useFinanceFormat } from '../../hooks/useFinanceFormat'
import type { BudgetType } from '../../types/BudgetDtos'
import type { DashboardBudgetCategoryDto, DashboardBudgetSummaryDto, DashboardBudgetsDto } from '../../types/DashboardDtos'
import { closedMonthsScore, isMonthOpen } from '../../utils/budgetStatus'
import BudgetProgress from '../BudgetProgress/BudgetProgress'
import './DashboardBudgets.css'

const GOALS_PATH = '/finance/planning/goals'

interface DashboardBudgetsProps {
  budgets: DashboardBudgetsDto
}

/**
 * How the period went against the goals: the month-total limit and target (summed over the months that had them,
 * and how many closed months met them), then the categories furthest from their goals.
 */
function DashboardBudgets({ budgets }: DashboardBudgetsProps) {
  const { t: translate } = useTranslation('finance')
  const { money, percent } = useFinanceFormat()
  const titleId = useId()
  const today = new Date()
  const includesOpenMonth = budgets.months.some((month) => isMonthOpen(month.year, month.month, today))

  if (!budgets.hasGoals) {
    return (
      <section className="lm-dashboard-budgets lm-dashboard-budgets--empty" aria-labelledby={titleId}>
        <div className="lm-dashboard-budgets__empty">
          <h2 id={titleId} className="lm-dashboard-budgets__title">
            {translate('finance:dashboard.budgets.title')}
          </h2>
          <p className="lm-dashboard-budgets__empty-text">{translate('finance:dashboard.budgets.empty')}</p>
        </div>
        <Link to={GOALS_PATH} className="lm-dashboard-budgets__cta">
          <Icon name="target" size={16} aria-hidden="true" />
          {translate('finance:dashboard.budgets.define')}
        </Link>
      </section>
    )
  }

  function renderSummary(type: BudgetType, summary: DashboardBudgetSummaryDto) {
    const isExpense = type === 'Expense'
    const title = translate(isExpense ? 'finance:dashboard.budgets.expenseTitle' : 'finance:dashboard.budgets.investmentTitle')

    if (summary.monthsWithGoal === 0 || summary.ratio === null) {
      return (
        <div className="lm-dashboard-budgets__summary">
          <span className="lm-dashboard-budgets__summary-title">{title}</span>
          <p className="lm-dashboard-budgets__muted">{translate('finance:dashboard.budgets.noTotalGoal')}</p>
        </div>
      )
    }

    const score = closedMonthsScore(
      budgets.months.map((month) => ({
        year: month.year,
        month: month.month,
        achieved: isExpense ? month.expenseAchieved : month.investmentAchieved,
      })),
      today,
    )

    return (
      <div className="lm-dashboard-budgets__summary">
        <BudgetProgress
          type={type}
          name={title}
          goal={summary.goal}
          actual={summary.actual}
          ratio={summary.ratio}
        />
        <p className="lm-dashboard-budgets__score">
          {score.total === 0
            ? translate('finance:dashboard.budgets.noClosedMonths')
            : translate(isExpense ? 'finance:dashboard.budgets.expenseScore' : 'finance:dashboard.budgets.investmentScore', {
                achieved: score.achieved,
                count: score.total,
              })}
        </p>
      </div>
    )
  }

  function renderCategories(type: BudgetType, categories: DashboardBudgetCategoryDto[]) {
    const isExpense = type === 'Expense'

    return (
      <div className="lm-dashboard-budgets__categories">
        <h3 className="lm-dashboard-budgets__categories-title">
          {translate(isExpense ? 'finance:dashboard.budgets.expenseCategoriesTitle' : 'finance:dashboard.budgets.investmentCategoriesTitle')}
        </h3>
        {categories.length === 0 ? (
          <p className="lm-dashboard-budgets__muted">
            {translate(isExpense ? 'finance:dashboard.budgets.noExpenseCategories' : 'finance:dashboard.budgets.noInvestmentCategories')}
          </p>
        ) : (
          <ul className="lm-dashboard-budgets__list">
            {categories.map((category) => {
              const missed = category.gap > 0
              return (
                <li key={category.categoryId} className="lm-dashboard-budgets__category">
                  <span className="lm-dashboard-budgets__category-name">{category.name}</span>
                  <span
                    className={`lm-dashboard-budgets__category-gap lm-numeric${missed ? ` lm-dashboard-budgets__category-gap--${isExpense ? 'over' : 'short'}` : ''}`}
                  >
                    {missed
                      ? translate(isExpense ? 'finance:dashboard.budgets.over' : 'finance:dashboard.budgets.short', {
                          amount: money(category.gap),
                        })
                      : translate(isExpense ? 'finance:dashboard.budgets.withinLimit' : 'finance:dashboard.budgets.reached')}
                  </span>
                  <span className="lm-dashboard-budgets__category-meta">
                    {translate('finance:dashboard.budgets.categoryMeta', {
                      percent: percent(category.ratio),
                      achieved: category.monthsAchieved,
                      count: category.monthsWithGoal,
                    })}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    )
  }

  return (
    <section className="lm-dashboard-budgets" aria-labelledby={titleId}>
      <div className="lm-dashboard-budgets__header">
        <h2 id={titleId} className="lm-dashboard-budgets__title">
          {translate('finance:dashboard.budgets.title')}
        </h2>
        <Link to={GOALS_PATH} className="lm-dashboard-budgets__manage">
          {translate('finance:dashboard.budgets.manage')}
          <Icon name="chevron-right" size={12} aria-hidden="true" />
        </Link>
      </div>

      <div className="lm-dashboard-budgets__summaries">
        {renderSummary('Expense', budgets.expense)}
        {renderSummary('Investment', budgets.investment)}
      </div>

      {includesOpenMonth ? <p className="lm-dashboard-budgets__note">{translate('finance:dashboard.budgets.inProgress')}</p> : null}

      <div className="lm-dashboard-budgets__columns">
        {renderCategories('Expense', budgets.expenseCategories)}
        {renderCategories('Investment', budgets.investmentCategories)}
      </div>
    </section>
  )
}

export default DashboardBudgets
