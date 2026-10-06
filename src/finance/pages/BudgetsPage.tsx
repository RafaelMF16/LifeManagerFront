import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import Button from '../../shared/components/Button/Button'
import { useErrorModal } from '../../shared/hooks/useErrorModal'
import { useToast } from '../../shared/hooks/useToast'
import { isSessionExpiredError } from '../../shared/services/httpClient'
import { isApiError } from '../../shared/types/ApiError'
import BudgetFormModal from '../components/BudgetFormModal/BudgetFormModal'
import BudgetMonthView from '../components/BudgetMonthView/BudgetMonthView'
import MonthNavigator from '../components/MonthNavigator/MonthNavigator'
import RemoveBudgetModal from '../components/RemoveBudgetModal/RemoveBudgetModal'
import { useBudgetMonth } from '../hooks/useBudgetMonth'
import { useCategoryOptions } from '../hooks/useCategoryOptions'
import { useFinanceFormat } from '../hooks/useFinanceFormat'
import type { BudgetProgressDto, BudgetType } from '../types/BudgetDtos'
import { parseYearMonth, toYearMonth } from '../utils/yearMonth'
import { BUDGET_NOT_FOUND_CODE } from '../validation/budgetErrorMap'
import type { BudgetFormValues } from '../validation/budgetSchema'
import './BudgetsPage.css'

interface FormTarget {
  type: BudgetType
  /** The goal being changed; null when creating one. */
  budget: BudgetProgressDto | null
}

interface RemoveTarget {
  type: BudgetType
  budget: BudgetProgressDto
}

/**
 * The goals of one month (`?month=yyyy-MM`, the current month by default), so the month details page can link to
 * a given month. Setting or removing a goal applies from the month on screen onwards.
 */
function BudgetsPage() {
  const { t: translate } = useTranslation(['finance', 'common'])
  const { show: showToast } = useToast()
  const { show: showErrorModal } = useErrorModal()
  const { periodLabel } = useFinanceFormat()
  const [searchParams, setSearchParams] = useSearchParams()
  const monthParam = searchParams.get('month')
  const month = parseYearMonth(monthParam) && monthParam ? monthParam : toYearMonth(new Date())
  const budgets = useBudgetMonth(month)
  const categoryOptions = useCategoryOptions()
  const [formTarget, setFormTarget] = useState<FormTarget | null>(null)
  const [removeTarget, setRemoveTarget] = useState<RemoveTarget | null>(null)

  const { setBudget, removeBudget, reload } = budgets
  const parsedMonth = parseYearMonth(month)
  const period = parsedMonth ? periodLabel(parsedMonth.month, parsedMonth.year) : month

  function changeMonth(next: string) {
    setSearchParams({ month: next }, { replace: true })
  }

  function nameOf(budget: BudgetProgressDto) {
    return budget.categoryName ?? translate('finance:budgets.total')
  }

  async function handleSubmitForm(values: BudgetFormValues) {
    await setBudget(values)
    showToast(translate('finance:budgets.toasts.saved'))
    setFormTarget(null)
  }

  async function handleConfirmRemove(target: RemoveTarget) {
    try {
      await removeBudget(target.budget.id, month)
      showToast(translate('finance:budgets.toasts.removed'))
    } catch (err) {
      if (isSessionExpiredError(err)) return
      if (!isApiError(err)) {
        showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
      } else if (err.code === BUDGET_NOT_FOUND_CODE) {
        showErrorModal(translate('finance:budgets.removeDialog.errorTitle'), translate('finance:budgets.validation.notFound'))
        reload()
      } else {
        showErrorModal(translate('finance:budgets.removeDialog.errorTitle'), translate('common:errors.generic'))
      }
    }
    setRemoveTarget(null)
  }

  function renderContent() {
    if (budgets.status === 'error') {
      return (
        <div className="lm-budgets-page__state">
          <span>{translate('finance:budgets.loadError')}</span>
          <Button variant="secondary" size="sm" onClick={reload}>
            {translate('finance:budgets.retry')}
          </Button>
        </div>
      )
    }

    if (!budgets.data) {
      return <div className="lm-budgets-page__state">{translate('finance:budgets.loading')}</div>
    }

    return (
      <div className={`lm-budgets-page__content${budgets.isFetching ? ' lm-budgets-page__content--fetching' : ''}`} aria-busy={budgets.isFetching}>
        <BudgetMonthView
          data={budgets.data}
          onCreate={(type) => setFormTarget({ type, budget: null })}
          onEdit={(type, budget) => setFormTarget({ type, budget })}
          onRemove={(type, budget) => setRemoveTarget({ type, budget })}
        />
      </div>
    )
  }

  return (
    <div className="lm-budgets-page">
      <div className="lm-budgets-page__header">
        <MonthNavigator month={month} onChange={changeMonth} />
        <Button variant="primary" icon="plus" onClick={() => setFormTarget({ type: 'Expense', budget: null })}>
          {translate('finance:budgets.newButton')}
        </Button>
      </div>

      <p className="lm-budgets-page__intro">{translate('finance:budgets.intro')}</p>

      {renderContent()}

      {formTarget ? (
        <BudgetFormModal
          type={formTarget.type}
          budget={formTarget.budget ?? undefined}
          month={month}
          categories={categoryOptions.categories}
          categoriesStatus={categoryOptions.status}
          onClose={() => setFormTarget(null)}
          onSubmit={handleSubmitForm}
        />
      ) : null}

      {removeTarget ? (
        <RemoveBudgetModal
          name={nameOf(removeTarget.budget)}
          period={period}
          onClose={() => setRemoveTarget(null)}
          onConfirm={() => handleConfirmRemove(removeTarget)}
        />
      ) : null}
    </div>
  )
}

export default BudgetsPage
