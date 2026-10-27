import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Icon from '../../../shared/components/Icon/Icon'
import { useFinanceFormat } from '../../hooks/useFinanceFormat'
import type { StatementImportMonthDto } from '../../types/StatementImportDtos'
import { parseYearMonth } from '../../utils/yearMonth'
import Amount from '../Amount/Amount'
import './ImportMonthsOverview.css'

const COLLAPSED_MONTHS = 7

interface ImportMonthsOverviewProps {
  months: StatementImportMonthDto[]
  /** `yyyy-MM` of the month the rows are filtered by, or null for every month. */
  selectedMonth: string | null
  onSelect: (month: string | null) => void
}

/**
 * The statement's months as cards: whether the month will be opened or already exists, what the included lines
 * add up to, and what still needs a category. Choosing one filters the rows below.
 */
function ImportMonthsOverview({ months, selectedMonth, onSelect }: ImportMonthsOverviewProps) {
  const { t: translate } = useTranslation('finance')
  const { periodLabel } = useFinanceFormat()
  const [expanded, setExpanded] = useState(false)

  // Years of statement would push the rows far down: the first months show, the rest on request. The chosen
  // month always stays visible.
  const collapsible = months.length > COLLAPSED_MONTHS
  const visibleMonths =
    expanded || !collapsible
      ? months
      : months.filter((month, index) => index < COLLAPSED_MONTHS || month.month === selectedMonth)

  return (
    <section className="lm-import-months" aria-labelledby="lm-import-months-title" data-tour="importReview.months">
      <h2 id="lm-import-months-title" className="lm-import-months__title">
        {translate('finance:imports.months.title')}
      </h2>
      <div className="lm-import-months__grid">
        <button
          type="button"
          className="lm-import-months__card lm-import-months__card--all"
          aria-pressed={selectedMonth === null}
          onClick={() => onSelect(null)}
        >
          <span className="lm-import-months__period">{translate('finance:imports.months.all')}</span>
          <span className="lm-import-months__detail">{translate('finance:imports.months.count', { count: months.length })}</span>
        </button>

        {visibleMonths.map((month) => {
          const parsed = parseYearMonth(month.month)
          const label = parsed ? periodLabel(parsed.month, parsed.year) : month.month
          const selected = selectedMonth === month.month

          return (
            <button
              key={month.month}
              type="button"
              className="lm-import-months__card"
              aria-pressed={selected}
              aria-label={translate('finance:imports.months.filterAria', { month: label })}
              onClick={() => onSelect(selected ? null : month.month)}
            >
              <span className="lm-import-months__head">
                <span className="lm-import-months__period">{label}</span>
                <span className={`lm-import-months__badge lm-import-months__badge--${month.monthlySummaryId === null ? 'new' : 'existing'}`}>
                  {translate(month.monthlySummaryId === null ? 'finance:imports.months.newMonth' : 'finance:imports.months.existingMonth')}
                </span>
              </span>
              <span className="lm-import-months__figures">
                <span className="lm-import-months__figure">
                  <span className="lm-import-months__figure-label">{translate('finance:imports.months.moneyIn')}</span>
                  <Amount value={month.totalIncome} tone="positive" />
                </span>
                <span className="lm-import-months__figure">
                  <span className="lm-import-months__figure-label">{translate('finance:imports.months.moneyOut')}</span>
                  <Amount value={month.totalExpense + month.totalInvestment} tone="negative" />
                </span>
              </span>
              <span className="lm-import-months__detail">
                {translate('finance:imports.months.included', { count: month.includedCount, total: month.rowCount })}
              </span>
              {month.uncategorizedCount > 0 ? (
                <span className="lm-import-months__pending">
                  <Icon name="tags" size={12} aria-hidden="true" />
                  {translate('finance:imports.months.pending', { count: month.uncategorizedCount })}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
      {collapsible ? (
        <Button variant="ghost" size="sm" icon={expanded ? 'chevron-up' : 'chevron-down'} onClick={() => setExpanded((value) => !value)} className="lm-import-months__toggle">
          {translate(expanded ? 'finance:imports.months.showLess' : 'finance:imports.months.showAll', { count: months.length })}
        </Button>
      ) : null}
    </section>
  )
}

export default ImportMonthsOverview
