import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../shared/components/Button/Button'
import Icon from '../../shared/components/Icon/Icon'
import IconButton from '../../shared/components/IconButton/IconButton'
import { useErrorModal } from '../../shared/hooks/useErrorModal'
import { useToast } from '../../shared/hooks/useToast'
import { isSessionExpiredError } from '../../shared/services/httpClient'
import { isApiError } from '../../shared/types/ApiError'
import DeleteTransactionModal from '../components/DeleteTransactionModal/DeleteTransactionModal'
import MonthBudgetsSummary from '../components/MonthBudgetsSummary/MonthBudgetsSummary'
import MonthTotals from '../components/MonthTotals/MonthTotals'
import TransactionFormModal from '../components/TransactionFormModal/TransactionFormModal'
import TransactionList from '../components/TransactionList/TransactionList'
import { useCategoryOptions } from '../hooks/useCategoryOptions'
import { useFinanceFormat } from '../hooks/useFinanceFormat'
import { useMonthlySummaryDetails } from '../hooks/useMonthlySummaryDetails'
import { useTransactions } from '../hooks/useTransactions'
import type { MoneyFlowType, TransactionResponseDto } from '../types/TransactionDtos'
import { TRANSACTION_NOT_FOUND_CODE } from '../validation/transactionErrorMap'
import type { TransactionFormValues } from '../validation/transactionSchema'
import './MonthDetailsPage.css'

type FormTarget = { mode: 'create' } | { mode: 'edit'; transaction: TransactionResponseDto }

const CREATED_TOAST_KEYS: Record<MoneyFlowType, string> = {
  Income: 'finance:transactions.toasts.createdIncome',
  Expense: 'finance:transactions.toasts.createdExpense',
  Investment: 'finance:transactions.toasts.createdInvestment',
}

function isCurrentMonth(year: number, month: number) {
  const today = new Date()
  return today.getFullYear() === year && today.getMonth() + 1 === month
}

/** One month: its totals and its transactions (list, filters, create/edit/delete). */
function MonthDetailsPage() {
  const { t: translate } = useTranslation(['finance', 'common'])
  const navigate = useNavigate()
  const { monthlySummaryId: idParam } = useParams()
  const monthlySummaryId = Number(idParam)
  const { show: showToast } = useToast()
  const { show: showErrorModal } = useErrorModal()
  const { periodLabel } = useFinanceFormat()
  const month = useMonthlySummaryDetails(monthlySummaryId)
  // Every transaction change moves the month's totals and its goals' actual amounts.
  const [budgetsRefreshKey, setBudgetsRefreshKey] = useState(0)
  const reloadMonth = month.reload
  const handleTransactionsMutated = useCallback(() => {
    reloadMonth()
    setBudgetsRefreshKey((key) => key + 1)
  }, [reloadMonth])
  const transactions = useTransactions(monthlySummaryId, handleTransactionsMutated)
  const categoryOptions = useCategoryOptions()
  const [formTarget, setFormTarget] = useState<FormTarget | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TransactionResponseDto | null>(null)

  const { createTransaction, updateTransaction, deleteTransaction, reloadAll } = transactions

  async function handleSubmitForm(values: TransactionFormValues) {
    if (formTarget?.mode === 'edit') {
      await updateTransaction(formTarget.transaction.id, values)
      showToast(translate('finance:transactions.toasts.updated'))
    } else {
      await createTransaction(values)
      showToast(translate(CREATED_TOAST_KEYS[values.type]))
    }
    setFormTarget(null)
  }

  async function handleConfirmDelete(transaction: TransactionResponseDto) {
    try {
      await deleteTransaction(transaction.id)
      showToast(translate('finance:transactions.toasts.deleted'))
    } catch (err) {
      if (isSessionExpiredError(err)) return
      if (!isApiError(err)) {
        showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
      } else if (err.code === TRANSACTION_NOT_FOUND_CODE) {
        showErrorModal(translate('finance:transactions.delete.errorTitle'), translate('finance:transactions.validation.notFound'))
        reloadAll()
      } else {
        showErrorModal(translate('finance:transactions.delete.errorTitle'), translate('common:errors.generic'))
      }
    }
    setDeleteTarget(null)
  }

  const backLink = (
    <Link to="/finance/months" className="lm-month-details__back">
      <Icon name="chevron-left" size={12} aria-hidden="true" />
      {translate('finance:monthDetails.back')}
    </Link>
  )

  if (month.status === 'notFound' || !Number.isInteger(monthlySummaryId)) {
    return (
      <main className="lm-month-details">
        {backLink}
        <div className="lm-month-details__state">
          <span>{translate('finance:monthDetails.notFound')}</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/finance/months')}>
            {translate('finance:monthDetails.backToMonths')}
          </Button>
        </div>
      </main>
    )
  }

  const data = month.data

  if (!data) {
    return (
      <main className="lm-month-details">
        {backLink}
        <div className="lm-month-details__state">
          {month.status === 'error' ? (
            <>
              <span>{translate('finance:monthDetails.loadError')}</span>
              <Button variant="secondary" size="sm" onClick={month.reload}>
                {translate('finance:monthDetails.retry')}
              </Button>
            </>
          ) : (
            <span>{translate('finance:monthDetails.loading')}</span>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="lm-month-details">
      <div className="lm-month-details__header">
        <div className="lm-month-details__heading">
          {backLink}
          <div className="lm-month-details__title-row">
            <h1 className="lm-month-details__title">{periodLabel(data.month, data.year)}</h1>
            {isCurrentMonth(data.year, data.month) ? (
              <span className="lm-month-details__badge">{translate('finance:monthDetails.currentMonth')}</span>
            ) : null}
          </div>
        </div>
        <div className="lm-month-details__actions">
          <IconButton
            icon="chevron-left"
            variant="secondary"
            label={translate('finance:monthDetails.previousMonth')}
            disabled={data.previousId === null}
            onClick={() => data.previousId !== null && navigate(`/finance/months/${data.previousId}`)}
          />
          <IconButton
            icon="chevron-right"
            variant="secondary"
            label={translate('finance:monthDetails.nextMonth')}
            disabled={data.nextId === null}
            onClick={() => data.nextId !== null && navigate(`/finance/months/${data.nextId}`)}
          />
          <Button variant="primary" icon="plus" onClick={() => setFormTarget({ mode: 'create' })} className="lm-month-details__new">
            {translate('finance:transactions.newButton')}
          </Button>
        </div>
      </div>

      <div className={month.isFetching ? 'lm-month-details__totals lm-month-details__totals--fetching' : 'lm-month-details__totals'}>
        <MonthTotals month={data} />
      </div>

      <MonthBudgetsSummary year={data.year} month={data.month} refreshKey={budgetsRefreshKey} />

      <TransactionList
        data={transactions.data}
        status={transactions.status}
        isFetching={transactions.isFetching}
        monthTransactionCount={data.incomeCount + data.expenseCount + data.investmentCount}
        categories={categoryOptions.categories}
        type={transactions.type}
        onTypeChange={transactions.setType}
        categoryId={transactions.categoryId}
        onCategoryChange={transactions.setCategoryId}
        searchInput={transactions.searchInput}
        onSearchChange={transactions.setSearchInput}
        hasFilters={transactions.hasFilters}
        onClearFilters={transactions.clearFilters}
        sortBy={transactions.sortBy}
        sortDirection={transactions.sortDirection}
        onSortByColumn={transactions.sortByColumn}
        onSortByChange={transactions.changeSortBy}
        onToggleSortDirection={transactions.toggleSortDirection}
        onPageChange={transactions.setPage}
        onRetry={transactions.reload}
        onCreate={() => setFormTarget({ mode: 'create' })}
        onEdit={(transaction) => setFormTarget({ mode: 'edit', transaction })}
        onDelete={setDeleteTarget}
      />

      {formTarget ? (
        <TransactionFormModal
          year={data.year}
          month={data.month}
          transaction={formTarget.mode === 'edit' ? formTarget.transaction : undefined}
          categories={categoryOptions.categories}
          categoriesStatus={categoryOptions.status}
          onClose={() => setFormTarget(null)}
          onSubmit={handleSubmitForm}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteTransactionModal
          transaction={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => handleConfirmDelete(deleteTarget)}
        />
      ) : null}
    </main>
  )
}

export default MonthDetailsPage
