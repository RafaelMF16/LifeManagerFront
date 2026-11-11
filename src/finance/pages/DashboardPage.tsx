import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../shared/components/Button/Button'
import Select from '../../shared/components/Select/Select'
import Skeleton from '../../shared/components/Skeleton/Skeleton'
import SkeletonGroup from '../../shared/components/Skeleton/SkeletonGroup'
import CategoryRanking from '../components/CategoryRanking/CategoryRanking'
import DashboardBudgets from '../components/DashboardBudgets/DashboardBudgets'
import DailySpendingCalendar from '../components/DailySpendingCalendar/DailySpendingCalendar'
import DashboardTotals from '../components/DashboardTotals/DashboardTotals'
import MonthlyFlowChart from '../components/MonthlyFlowChart/MonthlyFlowChart'
import QuickTransactionModal from '../components/QuickTransactionModal/QuickTransactionModal'
import { useFinanceDashboard } from '../hooks/useFinanceDashboard'
import { useFinanceFormat } from '../hooks/useFinanceFormat'
import type { DashboardPresetId } from '../types/DashboardDtos'
import { formatYearMonth } from '../utils/yearMonth'
import './DashboardPage.css'

const SKELETON_TOTALS = [0, 1, 2, 3]
const SKELETON_RANKINGS = ['expense', 'investment'] as const
const SKELETON_RANKING_ROWS = [0, 1, 2, 3]

/** The dashboard's first load: totals, chart and rankings, in the cards' own layout classes. */
function DashboardSkeleton({ label }: { label: string }) {
  return (
    <SkeletonGroup label={label} className="lm-dashboard-page__content">
      <div className="lm-dashboard-totals">
        {SKELETON_TOTALS.map((card) => (
          <div key={card} className="lm-dashboard-totals__card">
            <Skeleton width={80} />
            <Skeleton width="70%" height={24} />
            <Skeleton width="50%" />
          </div>
        ))}
      </div>
      <div className="lm-flow-chart">
        <div className="lm-flow-chart__header">
          <Skeleton width={160} height={18} />
        </div>
        <Skeleton shape="block" height="var(--lm-plot-height)" />
      </div>
      <div className="lm-dashboard-page__rankings">
        {SKELETON_RANKINGS.map((kind) => (
          <div key={kind} className={`lm-category-ranking lm-category-ranking--${kind}`}>
            <div className="lm-category-ranking__header">
              <Skeleton width={140} height={18} />
            </div>
            <div className="lm-category-ranking__list">
              {SKELETON_RANKING_ROWS.map((row) => (
                <div key={row} className="lm-category-ranking__row">
                  <Skeleton width={row % 2 === 0 ? '55%' : '40%'} className="lm-category-ranking__name" />
                  <Skeleton width={72} className="lm-category-ranking__amount" />
                  <Skeleton shape="block" height={6} className="lm-category-ranking__track" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SkeletonGroup>
  )
}

/** The Finance module's landing screen: a period's totals, month by month evolution and categories. */
function DashboardPage() {
  const { t: translate } = useTranslation('finance')
  const { rangeLabel } = useFinanceFormat()
  const { data, status, isFetching, reload, preset, setPreset, presets } = useFinanceDashboard()
  const [isQuickOpen, setIsQuickOpen] = useState(false)

  const presetOptions = presets.map((option) => ({
    value: option,
    label: option.startsWith('year:')
      ? translate('finance:dashboard.presets.year', { year: option.slice('year:'.length) })
      : translate(`finance:dashboard.presets.${option}`),
  }))

  const comparisonRange = data ? rangeLabel(data.comparisonPeriod.from, data.comparisonPeriod.to) : ''

  function renderContent() {
    if (status === 'error') {
      return (
        <div className="lm-dashboard-page__state">
          <span>{translate('finance:dashboard.loadError')}</span>
          <Button variant="secondary" size="sm" onClick={reload}>
            {translate('finance:dashboard.retry')}
          </Button>
        </div>
      )
    }

    if (!data) return <DashboardSkeleton label={translate('finance:dashboard.loading')} />

    // Keyed by period: a new period starts with its own newest month selected and every category closed.
    const periodKey = `${data.period.from}:${data.period.to}`

    return (
      <div
        className={`lm-dashboard-page__content${isFetching ? ' lm-dashboard-page__content--fetching' : ''}`}
        aria-busy={isFetching}
      >
        <DashboardTotals totals={data.totals} comparisonRange={comparisonRange} />
        <DailySpendingCalendar
          key={`days:${periodKey}`}
          months={data.months.map((month) => formatYearMonth(month.year, month.month))}
        />
        <MonthlyFlowChart key={periodKey} months={data.months} goals={data.budgets.months} />
        <DashboardBudgets budgets={data.budgets} />
        <div className="lm-dashboard-page__rankings" data-tour="dashboard.rankings">
          <CategoryRanking
            key={`expense:${periodKey}`}
            kind="expense"
            breakdown={data.expenses}
            months={data.months}
            comparisonRange={comparisonRange}
          />
          <CategoryRanking
            key={`investment:${periodKey}`}
            kind="investment"
            breakdown={data.investments}
            months={data.months}
            comparisonRange={comparisonRange}
          />
        </div>
      </div>
    )
  }

  return (
    <main className="lm-dashboard-page">
      <div className="lm-dashboard-page__header">
        <div className="lm-dashboard-page__heading">
          <span className="lm-dashboard-page__eyebrow">{translate('finance:module.name')}</span>
          <h1 className="lm-dashboard-page__title">{translate('finance:dashboard.title')}</h1>
        </div>

        <div className="lm-dashboard-page__tools">
          <Button
            variant="primary"
            icon="plus"
            data-tour="dashboard.newTransaction"
            onClick={() => setIsQuickOpen(true)}
          >
            {translate('finance:transactions.newButton')}
          </Button>

          <div className="lm-dashboard-page__period" data-tour="dashboard.period">
            <Select
              label={translate('finance:dashboard.periodLabel')}
              options={presetOptions}
              value={preset}
              onChange={(event) => setPreset(event.target.value as DashboardPresetId)}
              containerClassName="lm-dashboard-page__period-select"
            />
            {data ? (
              <span className="lm-dashboard-page__comparison">
                {translate('finance:dashboard.comparedTo', { range: comparisonRange })}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {renderContent()}

      {isQuickOpen ? <QuickTransactionModal onClose={() => setIsQuickOpen(false)} onSaved={reload} /> : null}
    </main>
  )
}

export default DashboardPage
