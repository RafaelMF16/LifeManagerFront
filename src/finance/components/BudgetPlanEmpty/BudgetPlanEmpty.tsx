import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import Icon from '../../../shared/components/Icon/Icon'
import './BudgetPlanEmpty.css'

interface BudgetPlanEmptyProps {
  /** The ways to start the month's plan (create, copy). */
  children?: ReactNode
}

/** A month without a plan yet. */
function BudgetPlanEmpty({ children }: BudgetPlanEmptyProps) {
  const { t: translate } = useTranslation('finance')

  return (
    <section className="lm-budget-plan-empty" aria-labelledby="lm-budget-plan-empty-title">
      <span className="lm-budget-plan-empty__icon" aria-hidden="true">
        <Icon name="target" size={24} />
      </span>
      <h2 id="lm-budget-plan-empty-title" className="lm-budget-plan-empty__title">
        {translate('finance:budgetPlan.empty.title')}
      </h2>
      <p className="lm-budget-plan-empty__text">{translate('finance:budgetPlan.empty.text')}</p>
      {children ? <div className="lm-budget-plan-empty__actions">{children}</div> : null}
    </section>
  )
}

export default BudgetPlanEmpty
