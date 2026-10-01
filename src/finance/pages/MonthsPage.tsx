import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../shared/components/Button/Button'
import { useToast } from '../../shared/hooks/useToast'
import MonthlySummaryFormModal from '../components/MonthlySummaryFormModal/MonthlySummaryFormModal'
import MonthlySummaryList from '../components/MonthlySummaryList/MonthlySummaryList'
import { useMonthlySummaries } from '../hooks/useMonthlySummaries'
import type { MonthlySummaryFormValues } from '../validation/monthlySummarySchema'
import './MonthsPage.css'

function MonthsPage() {
  const { t: translate } = useTranslation('finance')
  const { show: showToast } = useToast()
  const months = useMonthlySummaries()
  const [isFormOpen, setIsFormOpen] = useState(false)

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
        <Button variant="primary" icon="plus" onClick={() => setIsFormOpen(true)}>
          {translate('finance:months.newButton')}
        </Button>
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
    </main>
  )
}

export default MonthsPage
