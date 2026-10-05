import { useTranslation } from 'react-i18next'
import Button from '../../shared/components/Button/Button'
import Select from '../../shared/components/Select/Select'
import CategoryRanking from '../components/CategoryRanking/CategoryRanking'
import DashboardTotals from '../components/DashboardTotals/DashboardTotals'
import MonthlyFlowChart from '../components/MonthlyFlowChart/MonthlyFlowChart'
import { useFinanceDashboard } from '../hooks/useFinanceDashboard'
import { useFinanceFormat } from '../hooks/useFinanceFormat'
import type { DashboardPresetId } from '../types/DashboardDtos'
import './DashboardPage.css'

/** The Finance module's landing screen: a period's totals, month by month evolution and categories. */
function DashboardPage() {
  const { t: translate } = useTranslation('finance')
  const { rangeLabel } = useFinanceFormat()
  const { data, status, isFetching, reload, preset, setPreset, presets } = useFinanceDashboard()

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

    if (!data) {
      return <div className="lm-dashboard-page__state">{translate('finance:dashboard.loading')}</div>
    }

    // Keyed by period: a new period starts with its own newest month selected and every category closed.
    const periodKey = `${data.period.from}:${data.period.to}`

    return (
      <div
        className={`lm-dashboard-page__content${isFetching ? ' lm-dashboard-page__content--fetching' : ''}`}
        aria-busy={isFetching}
      >
        <DashboardTotals totals={data.totals} comparisonRange={comparisonRange} />
        <MonthlyFlowChart key={periodKey} months={data.months} />
        <div className="lm-dashboard-page__rankings">
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

        <div className="lm-dashboard-page__period">
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

      {renderContent()}
    </main>
  )
}

export default DashboardPage
