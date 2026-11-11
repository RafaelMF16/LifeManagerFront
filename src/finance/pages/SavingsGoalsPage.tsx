import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../shared/components/Button/Button'
import { useToast } from '../../shared/hooks/useToast'
import ArchiveSavingsGoalModal from '../components/ArchiveSavingsGoalModal/ArchiveSavingsGoalModal'
import SavingsGoalFormModal from '../components/SavingsGoalFormModal/SavingsGoalFormModal'
import SavingsGoalList from '../components/SavingsGoalList/SavingsGoalList'
import { useSavingsGoalActionError } from '../hooks/useSavingsGoalActionError'
import { useSavingsGoals } from '../hooks/useSavingsGoals'
import type { SavingsGoalResponseDto } from '../types/SavingsGoalDtos'
import type { SavingsGoalFormValues } from '../validation/savingsGoalSchema'
import './SavingsGoalsPage.css'

type FormTarget = { mode: 'create' } | { mode: 'edit'; goal: SavingsGoalResponseDto }

/** Savings goals: targets that grow with the investments linked to them. */
function SavingsGoalsPage() {
  const { t: translate } = useTranslation('finance')
  const { show: showToast } = useToast()
  const showActionError = useSavingsGoalActionError()
  const goals = useSavingsGoals()
  const [formTarget, setFormTarget] = useState<FormTarget | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<SavingsGoalResponseDto | null>(null)
  const [pendingId, setPendingId] = useState<number | null>(null)

  const { reload, createSavingsGoal, updateSavingsGoal, archiveSavingsGoal, restoreSavingsGoal } = goals

  async function handleSubmitForm(values: SavingsGoalFormValues) {
    if (formTarget?.mode === 'edit') {
      await updateSavingsGoal(formTarget.goal.id, values)
      showToast(translate('finance:savingsGoals.toasts.updated'))
    } else {
      await createSavingsGoal(values)
      showToast(translate('finance:savingsGoals.toasts.created'), translate('finance:savingsGoals.toasts.createdDetail'))
    }
    setFormTarget(null)
  }

  async function handleConfirmArchive(goal: SavingsGoalResponseDto) {
    try {
      await archiveSavingsGoal(goal.id)
      showToast(translate('finance:savingsGoals.toasts.archived'))
    } catch (err) {
      showActionError(err)
      reload()
    }
    setArchiveTarget(null)
  }

  async function handleRestore(goal: SavingsGoalResponseDto) {
    setPendingId(goal.id)
    try {
      await restoreSavingsGoal(goal.id)
      showToast(translate('finance:savingsGoals.toasts.restored'))
    } catch (err) {
      showActionError(err)
      reload()
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="lm-goals-page">
      <div className="lm-goals-page__header">
        <p className="lm-goals-page__intro">{translate('finance:savingsGoals.intro')}</p>
        <Button variant="primary" icon="plus" onClick={() => setFormTarget({ mode: 'create' })} data-tour="savings.create">
          {translate('finance:savingsGoals.newButton')}
        </Button>
      </div>

      <SavingsGoalList
        data={goals.data}
        status={goals.status}
        isFetching={goals.isFetching}
        statusFilter={goals.statusFilter}
        onStatusFilterChange={goals.setStatusFilter}
        searchInput={goals.searchInput}
        onSearchChange={goals.setSearchInput}
        hasSearch={goals.hasSearch}
        onClearSearch={goals.clearSearch}
        sortBy={goals.sortBy}
        sortDirection={goals.sortDirection}
        onSortByChange={goals.changeSortBy}
        onToggleSortDirection={goals.toggleSortDirection}
        onPageChange={goals.setPage}
        onRetry={reload}
        onCreate={() => setFormTarget({ mode: 'create' })}
        onEdit={(goal) => setFormTarget({ mode: 'edit', goal })}
        onArchive={setArchiveTarget}
        onRestore={(goal) => void handleRestore(goal)}
        pendingId={pendingId}
      />

      {formTarget ? (
        <SavingsGoalFormModal
          goal={formTarget.mode === 'edit' ? formTarget.goal : undefined}
          onClose={() => setFormTarget(null)}
          onSubmit={handleSubmitForm}
        />
      ) : null}

      {archiveTarget ? (
        <ArchiveSavingsGoalModal
          goal={archiveTarget}
          onClose={() => setArchiveTarget(null)}
          onConfirm={() => handleConfirmArchive(archiveTarget)}
        />
      ) : null}
    </div>
  )
}

export default SavingsGoalsPage
