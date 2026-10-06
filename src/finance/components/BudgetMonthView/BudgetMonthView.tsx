import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import type { BudgetGroupDto, BudgetMonthResponseDto, BudgetProgressDto, BudgetType } from '../../types/BudgetDtos'
import Amount from '../Amount/Amount'
import BudgetProgress from '../BudgetProgress/BudgetProgress'
import './BudgetMonthView.css'

// `id` doubles as an i18next key lookup (`finance:budgets.groups.${id}`).
const GROUPS: { id: 'expenses' | 'investments'; type: BudgetType; tone: 'negative' | 'investment' }[] = [
  { id: 'expenses', type: 'Expense', tone: 'negative' },
  { id: 'investments', type: 'Investment', tone: 'investment' },
]

interface BudgetMonthViewProps {
  data: BudgetMonthResponseDto
  onCreate: (type: BudgetType) => void
  onEdit: (type: BudgetType, item: BudgetProgressDto) => void
  onRemove: (type: BudgetType, item: BudgetProgressDto) => void
}

/** A month's goals in two groups, spending limits and investment targets: the month total first, then each category. */
function BudgetMonthView({ data, onCreate, onEdit, onRemove }: BudgetMonthViewProps) {
  const { t: translate } = useTranslation('finance')

  function nameOf(item: BudgetProgressDto) {
    return item.categoryName ?? translate('finance:budgets.total')
  }

  function renderGroup(group: (typeof GROUPS)[number], budgets: BudgetGroupDto) {
    const items = budgets.total ? [budgets.total, ...budgets.categories] : budgets.categories

    return (
      <section key={group.id} className="lm-budget-month__group" aria-labelledby={`lm-budget-month-${group.id}`}>
        <div className="lm-budget-month__group-header">
          <div className="lm-budget-month__group-heading">
            <h2 id={`lm-budget-month-${group.id}`} className="lm-budget-month__group-title">
              {translate(`finance:budgets.groups.${group.id}`)}
            </h2>
            <span className="lm-budget-month__group-actual">
              {translate('finance:budgets.groupActual')} <Amount value={budgets.actual} tone={group.tone} />
            </span>
          </div>
          <Button variant="ghost" size="sm" icon="plus" onClick={() => onCreate(group.type)}>
            {translate('finance:budgets.addGoal')}
          </Button>
        </div>

        {items.length === 0 ? (
          <p className="lm-budget-month__empty">{translate(`finance:budgets.emptyGroup.${group.id}`)}</p>
        ) : (
          <ul className="lm-budget-month__list">
            {items.map((item) => (
              <li key={item.id} className="lm-budget-month__item">
                <BudgetProgress
                  type={group.type}
                  name={nameOf(item)}
                  goal={item.goal}
                  actual={item.actual}
                  ratio={item.ratio}
                  effectiveFrom={item.effectiveFrom}
                  onEdit={() => onEdit(group.type, item)}
                  onRemove={() => onRemove(group.type, item)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    )
  }

  return (
    <div className="lm-budget-month">
      {renderGroup(GROUPS[0], data.expenses)}
      {renderGroup(GROUPS[1], data.investments)}
    </div>
  )
}

export default BudgetMonthView
