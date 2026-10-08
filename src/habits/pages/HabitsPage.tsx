import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../shared/components/Button/Button'
import { useErrorModal } from '../../shared/hooks/useErrorModal'
import { useToast } from '../../shared/hooks/useToast'
import { isSessionExpiredError } from '../../shared/services/httpClient'
import { isApiError } from '../../shared/types/ApiError'
import ArchiveHabitModal from '../components/ArchiveHabitModal/ArchiveHabitModal'
import HabitFormModal from '../components/HabitFormModal/HabitFormModal'
import HabitList from '../components/HabitList/HabitList'
import { useHabits } from '../hooks/useHabits'
import type { HabitResponseDto } from '../types/HabitDtos'
import { HABIT_NAME_ALREADY_EXISTS_CODE, HABIT_NOT_FOUND_CODE } from '../validation/habitErrorMap'
import type { HabitFormValues } from '../validation/habitSchema'
import './HabitsPage.css'

type FormTarget = { mode: 'create' } | { mode: 'edit'; habit: HabitResponseDto }

/** Where habits are created, edited, archived and restored. */
function HabitsPage() {
  const { t: translate } = useTranslation(['habits', 'common'])
  const { show: showToast } = useToast()
  const { show: showErrorModal } = useErrorModal()
  const habits = useHabits()
  const { reload, createHabit, updateHabit, archiveHabit, restoreHabit } = habits
  const [formTarget, setFormTarget] = useState<FormTarget | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<HabitResponseDto | null>(null)
  const [pendingId, setPendingId] = useState<number | null>(null)

  async function handleSubmitForm(values: HabitFormValues) {
    if (formTarget?.mode === 'edit') {
      await updateHabit(formTarget.habit.id, values)
      showToast(translate('habits:habits.toasts.updated'))
    } else {
      await createHabit(values)
      showToast(translate('habits:habits.toasts.created'))
    }
    setFormTarget(null)
  }

  /** Shows a failed archive or restore; a habit that is gone also refreshes the list. */
  function showActionError(err: unknown, titleKey: string) {
    if (isSessionExpiredError(err)) return
    if (!isApiError(err)) {
      showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
    } else if (err.code === HABIT_NOT_FOUND_CODE) {
      showErrorModal(translate(titleKey), translate('habits:habits.validation.notFound'))
      reload()
    } else if (err.code === HABIT_NAME_ALREADY_EXISTS_CODE) {
      showErrorModal(translate(titleKey), translate('habits:habits.restore.nameTaken'))
    } else {
      // e.g. already archived or restored in another tab: the refreshed list shows where it is now.
      showErrorModal(translate(titleKey), translate('common:errors.generic'))
      reload()
    }
  }

  async function handleConfirmArchive(habit: HabitResponseDto) {
    try {
      await archiveHabit(habit.id)
      showToast(translate('habits:habits.toasts.archived'))
    } catch (err) {
      showActionError(err, 'habits:habits.archive.errorTitle')
    }
    setArchiveTarget(null)
  }

  async function handleRestore(habit: HabitResponseDto) {
    setPendingId(habit.id)
    try {
      await restoreHabit(habit.id)
      showToast(translate('habits:habits.toasts.restored'))
    } catch (err) {
      showActionError(err, 'habits:habits.restore.errorTitle')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <main className="lm-habits-page">
      <div className="lm-habits-page__header">
        <div className="lm-habits-page__heading">
          <span className="lm-habits-page__eyebrow">{translate('habits:module.name')}</span>
          <h1 className="lm-habits-page__title">{translate('habits:habits.title')}</h1>
          <p className="lm-habits-page__intro">{translate('habits:habits.intro')}</p>
        </div>
        <Button variant="primary" icon="plus" onClick={() => setFormTarget({ mode: 'create' })}>
          {translate('habits:habits.newButton')}
        </Button>
      </div>

      <HabitList
        data={habits.data}
        status={habits.status}
        isFetching={habits.isFetching}
        statusFilter={habits.statusFilter}
        onStatusFilterChange={habits.setStatusFilter}
        searchInput={habits.searchInput}
        onSearchChange={habits.setSearchInput}
        appliedSearch={habits.search}
        sortBy={habits.sortBy}
        sortDirection={habits.sortDirection}
        onSortByChange={habits.changeSortBy}
        onToggleSortDirection={habits.toggleSortDirection}
        onPageChange={habits.setPage}
        onRetry={reload}
        onCreate={() => setFormTarget({ mode: 'create' })}
        onEdit={(habit) => setFormTarget({ mode: 'edit', habit })}
        onArchive={setArchiveTarget}
        onRestore={(habit) => void handleRestore(habit)}
        pendingId={pendingId}
      />

      {formTarget ? (
        <HabitFormModal
          habit={formTarget.mode === 'edit' ? formTarget.habit : undefined}
          onClose={() => setFormTarget(null)}
          onSubmit={handleSubmitForm}
        />
      ) : null}

      {archiveTarget ? (
        <ArchiveHabitModal
          habit={archiveTarget}
          onClose={() => setArchiveTarget(null)}
          onConfirm={() => handleConfirmArchive(archiveTarget)}
        />
      ) : null}
    </main>
  )
}

export default HabitsPage
