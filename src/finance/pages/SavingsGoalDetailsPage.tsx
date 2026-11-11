import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import Button from '../../shared/components/Button/Button'
import Icon from '../../shared/components/Icon/Icon'
import IconButton from '../../shared/components/IconButton/IconButton'
import Pagination from '../../shared/components/Pagination/Pagination'
import Skeleton from '../../shared/components/Skeleton/Skeleton'
import SkeletonGroup from '../../shared/components/Skeleton/SkeletonGroup'
import { useToast } from '../../shared/hooks/useToast'
import type { PagedResponse } from '../../shared/types/Paging'
import Amount from '../components/Amount/Amount'
import ArchiveSavingsGoalModal from '../components/ArchiveSavingsGoalModal/ArchiveSavingsGoalModal'
import SavingsGoalCard from '../components/SavingsGoalCard/SavingsGoalCard'
import SavingsGoalChart from '../components/SavingsGoalChart/SavingsGoalChart'
import SavingsGoalFormModal from '../components/SavingsGoalFormModal/SavingsGoalFormModal'
import { useFinanceFormat } from '../hooks/useFinanceFormat'
import { useSavingsGoal } from '../hooks/useSavingsGoal'
import { useSavingsGoalActionError } from '../hooks/useSavingsGoalActionError'
import { archiveSavingsGoal, restoreSavingsGoal, updateSavingsGoal } from '../services/savingsGoalService'
import type { SavingsGoalTransactionDto } from '../types/SavingsGoalDtos'
import type { SavingsGoalFormValues } from '../validation/savingsGoalSchema'
import './SavingsGoalDetailsPage.css'

/** One savings goal: the large card, what was saved per month and the transactions linked to it, across months. */
function SavingsGoalDetailsPage() {
  const { t: translate } = useTranslation('finance')
  const { dayLabel, periodLabel } = useFinanceFormat()
  const { show: showToast } = useToast()
  const showActionError = useSavingsGoalActionError()
  const { goalId: idParam } = useParams()
  const goalId = Number(idParam)
  const details = useSavingsGoal(goalId)
  const [editing, setEditing] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [restoring, setRestoring] = useState(false)

  const { goal, reload } = details

  const backLink = (
    <Link to="/finance/planning/savings" className="lm-goal-details__back">
      <Icon name="chevron-left" size={12} aria-hidden="true" />
      {translate('finance:savingsGoals.details.back')}
    </Link>
  )

  if (details.status === 'notFound' || !Number.isInteger(goalId)) {
    return (
      <div className="lm-goal-details">
        {backLink}
        <div className="lm-goal-details__state">
          <span>{translate('finance:savingsGoals.details.notFound')}</span>
        </div>
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="lm-goal-details">
        {backLink}
        {details.status === 'error' ? (
          <div className="lm-goal-details__state">
            <span>{translate('finance:savingsGoals.details.loadError')}</span>
            <Button variant="secondary" size="sm" onClick={reload}>
              {translate('finance:savingsGoals.details.retry')}
            </Button>
          </div>
        ) : (
          <SkeletonGroup label={translate('finance:savingsGoals.list.loading')} className="lm-goal-details__skeleton">
            <Skeleton shape="block" height={168} />
            <Skeleton shape="block" height={260} />
          </SkeletonGroup>
        )}
      </div>
    )
  }

  const current = goal
  const archived = current.archivedAt !== null

  async function handleSubmitForm(values: SavingsGoalFormValues) {
    await updateSavingsGoal(current.id, values)
    showToast(translate('finance:savingsGoals.toasts.updated'))
    setEditing(false)
    reload()
  }

  async function handleConfirmArchive() {
    try {
      await archiveSavingsGoal(current.id)
      showToast(translate('finance:savingsGoals.toasts.archived'))
    } catch (err) {
      showActionError(err)
    }
    setArchiving(false)
    reload()
  }

  async function handleRestore() {
    setRestoring(true)
    try {
      await restoreSavingsGoal(current.id)
      showToast(translate('finance:savingsGoals.toasts.restored'))
    } catch (err) {
      showActionError(err)
    } finally {
      setRestoring(false)
      reload()
    }
  }

  const actions = archived ? (
    <Button variant="secondary" size="sm" icon="archive-restore" loading={restoring} onClick={() => void handleRestore()}>
      {translate('finance:savingsGoals.list.restore')}
    </Button>
  ) : (
    <>
      <IconButton icon="pencil" size="sm" label={translate('finance:savingsGoals.list.edit')} onClick={() => setEditing(true)} />
      <IconButton icon="archive" size="sm" label={translate('finance:savingsGoals.list.archive')} onClick={() => setArchiving(true)} />
    </>
  )

  function monthLabel(isoDate: string) {
    const [year, month] = isoDate.split('-').map(Number)
    return periodLabel(month, year)
  }

  function renderTransactions() {
    const data = details.transactions
    if (details.transactionsStatus === 'loading') {
      return (
        <SkeletonGroup label={translate('finance:savingsGoals.list.loading')} className="lm-goal-details__rows">
          {[0, 1, 2].map((row) => (
            <div key={row} className="lm-goal-details__row">
              <Skeleton width={48} />
              <Skeleton width={row % 2 === 0 ? 160 : 120} />
              <Skeleton width={72} />
            </div>
          ))}
        </SkeletonGroup>
      )
    }
    if (details.transactionsStatus === 'error' || !data) {
      return (
        <div className="lm-goal-details__empty">
          <span>{translate('finance:savingsGoals.details.transactions.loadError')}</span>
          <Button variant="secondary" size="sm" onClick={reload}>
            {translate('finance:savingsGoals.details.retry')}
          </Button>
        </div>
      )
    }
    if (data.totalCount === 0) {
      return (
        <div className="lm-goal-details__empty">
          <span className="lm-goal-details__empty-title">{translate('finance:savingsGoals.details.transactions.empty')}</span>
          {archived ? null : <span>{translate('finance:savingsGoals.details.transactions.emptyHint')}</span>}
        </div>
      )
    }
    return (
      <div className="lm-goal-details__rows">
        {data.items.map((item) => (
          <div key={item.id} className="lm-goal-details__row">
            <span className="lm-goal-details__date lm-numeric">{dayLabel(item.date)}</span>
            <span className="lm-goal-details__description">
              <span className="lm-goal-details__description-text">{item.description}</span>
              <span className="lm-goal-details__meta">
                <span className="lm-goal-details__badge">{item.categoryName}</span>
                <Link
                  to={`/finance/months/${item.monthlySummaryId}`}
                  className="lm-goal-details__month-link"
                  aria-label={translate('finance:savingsGoals.details.transactions.openMonth', { period: monthLabel(item.date) })}
                >
                  {monthLabel(item.date)}
                  <Icon name="chevron-right" size={12} aria-hidden="true" />
                </Link>
              </span>
            </span>
            <Amount value={-item.amount} tone="investment" />
          </div>
        ))}
      </div>
    )
  }

  function rangeLabel(page: PagedResponse<SavingsGoalTransactionDto>) {
    if (page.totalCount === 0) return translate('finance:savingsGoals.details.pagination.none')
    const from = (page.page - 1) * page.pageSize + 1
    return translate('finance:savingsGoals.details.pagination.range', { from, to: from + page.items.length - 1, count: page.totalCount })
  }

  const transactions = details.transactions

  return (
    <div className="lm-goal-details">
      {backLink}

      <SavingsGoalCard
        goal={current}
        size="large"
        title={<h2 className="lm-goal-details__title">{current.name}</h2>}
        actions={actions}
      />

      {archived ? <p className="lm-goal-details__notice">{translate('finance:savingsGoals.details.archivedNotice')}</p> : null}

      {current.monthly ? <SavingsGoalChart monthly={current.monthly} /> : null}

      <section
        className={`lm-goal-details__transactions${details.transactionsFetching && transactions ? ' lm-goal-details__transactions--fetching' : ''}`}
        aria-busy={details.transactionsFetching}
      >
        <div className="lm-goal-details__transactions-header">
          <h2 className="lm-goal-details__transactions-title">{translate('finance:savingsGoals.details.transactions.title')}</h2>
          {current.initialAmount > 0 ? (
            <span className="lm-goal-details__initial">
              {translate('finance:savingsGoals.details.initial')}: <Amount value={current.initialAmount} tone="investment" />
            </span>
          ) : null}
        </div>
        {renderTransactions()}
        {transactions && transactions.totalPages > 1 ? (
          <Pagination
            page={transactions.page}
            totalPages={transactions.totalPages}
            rangeLabel={rangeLabel(transactions)}
            onPageChange={details.setPage}
          />
        ) : null}
      </section>

      {editing ? <SavingsGoalFormModal goal={current} onClose={() => setEditing(false)} onSubmit={handleSubmitForm} /> : null}

      {archiving ? (
        <ArchiveSavingsGoalModal goal={current} onClose={() => setArchiving(false)} onConfirm={handleConfirmArchive} />
      ) : null}
    </div>
  )
}

export default SavingsGoalDetailsPage
