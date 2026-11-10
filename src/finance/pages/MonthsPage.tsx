import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../../shared/components/Button/Button'
import { useToast } from '../../shared/hooks/useToast'
import MonthlySummaryFormModal from '../components/MonthlySummaryFormModal/MonthlySummaryFormModal'
import MonthlySummaryList from '../components/MonthlySummaryList/MonthlySummaryList'
import QuickTransactionModal from '../components/QuickTransactionModal/QuickTransactionModal'
import { useMonthlySummaries } from '../hooks/useMonthlySummaries'
import type { MonthlySummaryFormValues } from '../validation/monthlySummarySchema'
import './MonthsPage.css'

function MonthsPage() {
  const { t: translate } = useTranslation('finance')
  const { show: showToast } = useToast()
  const navigate = useNavigate()
  const months = useMonthlySummaries()
  const [isFormOpen, setIsFormOpen] = useState(false)
  // `?new=1` (the app's "New transaction" shortcut) opens the quick entry right away.
  const [searchParams, setSearchParams] = useSearchParams()
  const [isQuickOpen, setIsQuickOpen] = useState(() => searchParams.get('new') === '1')

  // Drop `?new=1` once read, so a reload or going back doesn't open the entry again.
  useEffect(() => {
    if (!searchParams.has('new')) return
    setSearchParams(
      (params) => {
        params.delete('new')
        return params
      },
      { replace: true },
    )
  }, [searchParams, setSearchParams])

  async function handleCreate(values: MonthlySummaryFormValues) {
    await months.createMonthlySummary(values)
    showToast(translate('finance:months.toasts.created'))
    setIsFormOpen(false)
  }

  return (
    <main className="lm-months-page">
      <div className="lm-months-page__header">
        <div className="lm-months-page__heading">
          <span className="lm-months-page__eyebrow">{translate('finance:module.name')}</span>
          <h1 className="lm-months-page__title">{translate('finance:months.title')}</h1>
        </div>
        <div className="lm-months-page__actions" data-tour="months.actions">
          <Button variant="secondary" icon="upload" onClick={() => navigate('/finance/imports')}>
            {translate('finance:imports.monthsButton')}
          </Button>
          <Button variant="secondary" icon="calendar" onClick={() => setIsFormOpen(true)}>
            {translate('finance:months.newButton')}
          </Button>
          <Button variant="primary" icon="plus" className="lm-months-page__quick" onClick={() => setIsQuickOpen(true)}>
            {translate('finance:transactions.newButton')}
          </Button>
        </div>
      </div>

      <MonthlySummaryList
        data={months.data}
        status={months.status}
        isFetching={months.isFetching}
        years={months.years}
        year={months.year}
        onYearChange={months.setYear}
        balance={months.balance}
        onBalanceChange={months.setBalance}
        hasFilters={months.hasFilters}
        onClearFilters={months.clearFilters}
        sortBy={months.sortBy}
        sortDirection={months.sortDirection}
        onSortByColumn={months.sortByColumn}
        onSortByChange={months.setSortBy}
        onToggleSortDirection={months.toggleSortDirection}
        onPageChange={months.setPage}
        onRetry={months.reload}
        onCreate={() => setIsFormOpen(true)}
      />

      {isFormOpen ? <MonthlySummaryFormModal onClose={() => setIsFormOpen(false)} onSubmit={handleCreate} /> : null}
      {isQuickOpen ? <QuickTransactionModal onClose={() => setIsQuickOpen(false)} onSaved={months.reload} /> : null}
    </main>
  )
}

export default MonthsPage
