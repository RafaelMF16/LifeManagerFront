import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../shared/components/Button/Button'
import { useErrorModal } from '../../shared/hooks/useErrorModal'
import { useToast } from '../../shared/hooks/useToast'
import { isSessionExpiredError } from '../../shared/services/httpClient'
import { isApiError } from '../../shared/types/ApiError'
import DeleteRecurringTransactionModal from '../components/DeleteRecurringTransactionModal/DeleteRecurringTransactionModal'
import RecurringTransactionFormModal from '../components/RecurringTransactionFormModal/RecurringTransactionFormModal'
import RecurringTransactionList from '../components/RecurringTransactionList/RecurringTransactionList'
import { useCategoryOptions } from '../hooks/useCategoryOptions'
import { useRecurringTransactions } from '../hooks/useRecurringTransactions'
import type { RecurringTransactionResponseDto } from '../types/RecurringTransactionDtos'
import {
  RECURRING_TRANSACTION_CHANGED_CONCURRENTLY_CODE,
  RECURRING_TRANSACTION_NOT_FOUND_CODE,
} from '../validation/recurringTransactionErrorMap'
import type { RecurringTransactionFormValues } from '../validation/recurringTransactionSchema'
import './RecurringTransactionsPage.css'

type FormTarget = { mode: 'create' } | { mode: 'edit'; recurringTransaction: RecurringTransactionResponseDto }

/** Recurring transactions: what posts by itself every month, on its day, until it ends or is paused. */
function RecurringTransactionsPage() {
  const { t: translate } = useTranslation(['finance', 'common'])
  const { show: showToast } = useToast()
  const { show: showErrorModal } = useErrorModal()
  const recurring = useRecurringTransactions()
  const categoryOptions = useCategoryOptions()
  const [formTarget, setFormTarget] = useState<FormTarget | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RecurringTransactionResponseDto | null>(null)
  const [pendingId, setPendingId] = useState<number | null>(null)

  const {
    reload,
    createRecurringTransaction,
    updateRecurringTransaction,
    pauseRecurringTransaction,
    resumeRecurringTransaction,
    deleteRecurringTransaction,
  } = recurring

  async function handleSubmitForm(values: RecurringTransactionFormValues) {
    if (formTarget?.mode === 'edit') {
      await updateRecurringTransaction(formTarget.recurringTransaction.id, values)
      showToast(translate('finance:recurring.toasts.updated'))
    } else {
      await createRecurringTransaction(values)
      showToast(translate('finance:recurring.toasts.created'), translate('finance:recurring.toasts.createdDetail'))
    }
    setFormTarget(null)
  }

  /** Errors from list actions (pause, resume, delete) all end in an error modal. */
  function showActionError(err: unknown) {
    if (isSessionExpiredError(err)) return
    if (!isApiError(err)) {
      showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
    } else if (err.code === RECURRING_TRANSACTION_NOT_FOUND_CODE) {
      showErrorModal(translate('finance:recurring.errors.actionTitle'), translate('finance:recurring.validation.notFound'))
    } else if (err.code === RECURRING_TRANSACTION_CHANGED_CONCURRENTLY_CODE) {
      showErrorModal(translate('finance:recurring.errors.actionTitle'), translate('finance:recurring.errors.changedConcurrently'))
    } else {
      showErrorModal(translate('finance:recurring.errors.actionTitle'), translate('common:errors.generic'))
    }
    reload()
  }

  async function handleTogglePause(item: RecurringTransactionResponseDto) {
    setPendingId(item.id)
    try {
      if (item.status === 'Paused') {
        await resumeRecurringTransaction(item.id)
        showToast(translate('finance:recurring.toasts.resumed'))
      } else {
        await pauseRecurringTransaction(item.id)
        showToast(translate('finance:recurring.toasts.paused'))
      }
    } catch (err) {
      showActionError(err)
    } finally {
      setPendingId(null)
    }
  }

  async function handleConfirmDelete(item: RecurringTransactionResponseDto) {
    try {
      await deleteRecurringTransaction(item.id)
      showToast(translate('finance:recurring.toasts.deleted'))
    } catch (err) {
      showActionError(err)
    }
    setDeleteTarget(null)
  }

  return (
    <div className="lm-recurring-page">
      <div className="lm-recurring-page__header">
        <p className="lm-recurring-page__intro">{translate('finance:recurring.intro')}</p>
        <Button variant="primary" icon="plus" onClick={() => setFormTarget({ mode: 'create' })}>
          {translate('finance:recurring.newButton')}
        </Button>
      </div>

      <RecurringTransactionList
        data={recurring.data}
        status={recurring.status}
        isFetching={recurring.isFetching}
        type={recurring.type}
        onTypeChange={recurring.setType}
        statusFilter={recurring.statusFilter}
        onStatusFilterChange={recurring.setStatusFilter}
        searchInput={recurring.searchInput}
        onSearchChange={recurring.setSearchInput}
        hasFilters={recurring.hasFilters}
        onClearFilters={recurring.clearFilters}
        sortBy={recurring.sortBy}
        sortDirection={recurring.sortDirection}
        onSortByChange={recurring.changeSortBy}
        onToggleSortDirection={recurring.toggleSortDirection}
        onPageChange={recurring.setPage}
        onRetry={reload}
        onCreate={() => setFormTarget({ mode: 'create' })}
        onEdit={(recurringTransaction) => setFormTarget({ mode: 'edit', recurringTransaction })}
        onTogglePause={(item) => void handleTogglePause(item)}
        onDelete={setDeleteTarget}
        pendingId={pendingId}
      />

      {formTarget ? (
        <RecurringTransactionFormModal
          recurringTransaction={formTarget.mode === 'edit' ? formTarget.recurringTransaction : undefined}
          categories={categoryOptions.categories}
          categoriesStatus={categoryOptions.status}
          onClose={() => setFormTarget(null)}
          onSubmit={handleSubmitForm}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteRecurringTransactionModal
          recurringTransaction={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => handleConfirmDelete(deleteTarget)}
        />
      ) : null}
    </div>
  )
}

export default RecurringTransactionsPage
