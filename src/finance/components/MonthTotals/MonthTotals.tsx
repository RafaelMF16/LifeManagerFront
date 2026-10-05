import { useTranslation } from 'react-i18next'
import { useFinanceFormat } from '../../hooks/useFinanceFormat'
import type { MonthlySummaryDetailsDto } from '../../types/MonthlySummaryDtos'
import Amount from '../Amount/Amount'
import './MonthTotals.css'

interface MonthTotalsProps {
  month: MonthlySummaryDetailsDto
}

/** Income, expenses, investment and balance of one month, each with the figure that explains it. */
function MonthTotals({ month }: MonthTotalsProps) {
  const { t: translate } = useTranslation('finance')
  const { percent } = useFinanceFormat()

  const balanceCaption =
    month.totalIncome > 0
      ? translate('finance:monthDetails.totals.spentShare', { percent: percent(month.totalExpense / month.totalIncome) })
      : translate('finance:monthDetails.totals.noIncome')

  return (
    <section className="lm-month-totals">
      <div className="lm-month-totals__card">
        <span className="lm-month-totals__label">{translate('finance:monthDetails.totals.income')}</span>
        <Amount value={month.totalIncome} tone="positive" emphasis className="lm-month-totals__value" />
        <span className="lm-month-totals__caption">
          {translate('finance:monthDetails.totals.count', { count: month.incomeCount })}
        </span>
      </div>
      <div className="lm-month-totals__card">
        <span className="lm-month-totals__label">{translate('finance:monthDetails.totals.expense')}</span>
        <Amount value={month.totalExpense} tone="negative" emphasis className="lm-month-totals__value" />
        <span className="lm-month-totals__caption">
          {translate('finance:monthDetails.totals.count', { count: month.expenseCount })}
        </span>
      </div>
      <div className="lm-month-totals__card">
        <span className="lm-month-totals__label">{translate('finance:monthDetails.totals.investment')}</span>
        <Amount value={month.totalInvestment} tone="investment" emphasis className="lm-month-totals__value" />
        <span className="lm-month-totals__caption">
          {translate('finance:monthDetails.totals.count', { count: month.investmentCount })}
        </span>
      </div>
      <div className="lm-month-totals__card">
        <span className="lm-month-totals__label">{translate('finance:monthDetails.totals.balance')}</span>
        <Amount value={month.balance} tone="signed" emphasis className="lm-month-totals__value" />
        <span className="lm-month-totals__caption">{balanceCaption}</span>
      </div>
    </section>
  )
}

export default MonthTotals
