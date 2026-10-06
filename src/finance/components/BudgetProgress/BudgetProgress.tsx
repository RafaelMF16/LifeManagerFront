import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import IconButton from '../../../shared/components/IconButton/IconButton'
import { useFinanceFormat } from '../../hooks/useFinanceFormat'
import { usePrivacyMode } from '../../hooks/usePrivacyMode'
import type { BudgetType } from '../../types/BudgetDtos'
import { budgetStatus } from '../../utils/budgetStatus'
import { parseYearMonth } from '../../utils/yearMonth'
import './BudgetProgress.css'

/** Hidden bars all get this length: their real lengths would give the proportions away. */
const HIDDEN_BAR_RATIO = 0.5

interface BudgetProgressProps {
  type: BudgetType
  /** The category's name, "month total", or what the goal is about. */
  name: string
  goal: number
  actual: number
  /** Actual / goal, as the backend sends it (1 = exactly the goal). */
  ratio: number
  /** `yyyy-MM` the goal has been in force since; shown as "since …" when given. */
  effectiveFrom?: string
  /** Omitted for a read-only row (e.g. the month details summary). */
  onEdit?: () => void
  onRemove?: () => void
}

/**
 * One goal in one month: how much was spent (or invested) against it, as a bar and in words. A spending limit
 * turns amber near it and red past it; an investment target turns green once reached.
 */
function BudgetProgress({ type, name, goal, actual, ratio, effectiveFrom, onEdit, onRemove }: BudgetProgressProps) {
  const { t: translate } = useTranslation('finance')
  const { money, shortMonthName } = useFinanceFormat()
  const { hidden } = usePrivacyMode()
  const status = budgetStatus(type, ratio)
  const remaining = goal - actual

  const barStyle = { '--lm-bar': hidden ? HIDDEN_BAR_RATIO : Math.min(Math.max(ratio, 0), 1) } as CSSProperties

  function remainingLabel() {
    if (type === 'Expense') {
      return remaining >= 0
        ? translate('finance:budgets.progress.remaining', { amount: money(remaining) })
        : translate('finance:budgets.progress.over', { amount: money(remaining) })
    }
    return remaining > 0
      ? translate('finance:budgets.progress.toGo', { amount: money(remaining) })
      : translate('finance:budgets.progress.reached')
  }

  const from = effectiveFrom ? parseYearMonth(effectiveFrom) : null
  const since = from ? translate('finance:budgets.progress.since', { month: `${shortMonthName(from.month)} ${from.year}` }) : ''

  return (
    <div className={`lm-budget-progress lm-budget-progress--${status}${hidden ? ' lm-budget-progress--hidden' : ''}`}>
      <div className="lm-budget-progress__top">
        <span className="lm-budget-progress__name">{name}</span>
        <span className="lm-budget-progress__figures lm-numeric">
          {translate('finance:budgets.progress.ofGoal', { actual: money(actual), goal: money(goal) })}
        </span>
      </div>

      <span
        className="lm-budget-progress__track"
        role="img"
        aria-label={translate(`finance:budgets.progress.status.${status}`)}
      >
        <span className="lm-budget-progress__fill" style={barStyle} />
      </span>

      <div className="lm-budget-progress__bottom">
        <span className="lm-budget-progress__status">
          <span className="lm-budget-progress__dot" aria-hidden="true" />
          {remainingLabel()}
        </span>
        {since ? <span className="lm-budget-progress__since">{since}</span> : null}
        {onEdit || onRemove ? (
          <span className="lm-budget-progress__actions">
            {onEdit ? <IconButton icon="pencil" size="sm" label={translate('finance:budgets.edit')} onClick={onEdit} /> : null}
            {onRemove ? <IconButton icon="trash-2" size="sm" label={translate('finance:budgets.remove')} onClick={onRemove} /> : null}
          </span>
        ) : null}
      </div>
    </div>
  )
}

export default BudgetProgress
