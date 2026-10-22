import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { useFinanceFormat } from '../../hooks/useFinanceFormat'
import { usePrivacyMode } from '../../hooks/usePrivacyMode'
import type { BudgetSliceType } from '../../types/BudgetPlanDtos'
import { budgetStatus } from '../../utils/budgetStatus'
import './BudgetProgress.css'

/** Hidden bars all get this length: their real lengths would give the proportions away. */
const HIDDEN_BAR_RATIO = 0.5

interface BudgetProgressProps {
  type: BudgetSliceType
  /** The category's name, or what the goal is about (investments, the free part). */
  name: string
  goal: number
  actual: number
  /** Actual / goal (1 = exactly the goal). */
  ratio: number
}

/**
 * One goal in one month, read-only: how much was spent (or invested) against it, as a bar and in words. A spending
 * limit turns amber near it and red past it; an investment target turns green once reached.
 */
function BudgetProgress({ type, name, goal, actual, ratio }: BudgetProgressProps) {
  const { t: translate } = useTranslation('finance')
  const { money } = useFinanceFormat()
  const { hidden } = usePrivacyMode()
  const status = budgetStatus(type, ratio)
  const remaining = goal - actual

  const barStyle = { '--lm-bar': hidden ? HIDDEN_BAR_RATIO : Math.min(Math.max(ratio, 0), 1) } as CSSProperties

  function remainingLabel() {
    if (type === 'Expense') {
      return remaining >= 0
        ? translate('finance:budgetPlan.goal.remaining', { amount: money(remaining) })
        : translate('finance:budgetPlan.goal.over', { amount: money(remaining) })
    }
    return remaining > 0
      ? translate('finance:budgetPlan.goal.toGo', { amount: money(remaining) })
      : translate('finance:budgetPlan.goal.reached')
  }

  return (
    <div className={`lm-budget-progress lm-budget-progress--${status}${hidden ? ' lm-budget-progress--hidden' : ''}`}>
      <div className="lm-budget-progress__top">
        <span className="lm-budget-progress__name">{name}</span>
        <span className="lm-budget-progress__figures lm-numeric">
          {translate('finance:budgetPlan.goal.ofGoal', { actual: money(actual), goal: money(goal) })}
        </span>
      </div>

      <span className="lm-budget-progress__track" role="img" aria-label={translate(`finance:budgetPlan.status.${status}`)}>
        <span className="lm-budget-progress__fill" style={barStyle} />
      </span>

      <div className="lm-budget-progress__bottom">
        <span className="lm-budget-progress__status">
          <span className="lm-budget-progress__dot" aria-hidden="true" />
          {remainingLabel()}
        </span>
      </div>
    </div>
  )
}

export default BudgetProgress
