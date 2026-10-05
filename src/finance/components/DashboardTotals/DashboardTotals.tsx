import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import type { DashboardAmountDto, DashboardTotalsDto } from '../../types/DashboardDtos'
import Amount from '../Amount/Amount'
import DashboardChange from '../DashboardChange/DashboardChange'
import './DashboardTotals.css'

interface DashboardTotalsProps {
  totals: DashboardTotalsDto
  /** The comparison period, e.g. "Abr – Set 2025". */
  comparisonRange: string
}

type TotalId = keyof DashboardTotalsDto

// `id` doubles as an i18next key lookup (`finance:dashboard.totals.${id}`).
const CARDS: { id: TotalId; tone: 'positive' | 'negative' | 'investment' | 'signed'; changeAs: 'percent' | 'money' }[] = [
  { id: 'income', tone: 'positive', changeAs: 'percent' },
  { id: 'expense', tone: 'negative', changeAs: 'percent' },
  { id: 'investment', tone: 'investment', changeAs: 'percent' },
  { id: 'balance', tone: 'signed', changeAs: 'money' },
]

/** The period's income, expenses, investment and balance, each with how it moved against the comparison period. */
function DashboardTotals({ totals, comparisonRange }: DashboardTotalsProps) {
  const { t: translate } = useTranslation('finance')
  const titleId = useId()

  return (
    <section className="lm-dashboard-totals" aria-labelledby={titleId}>
      <h2 id={titleId} className="lm-dashboard-totals__title">
        {translate('finance:dashboard.totals.label')}
      </h2>
      {CARDS.map((card) => {
        const amount: DashboardAmountDto = totals[card.id]
        return (
          <div key={card.id} className="lm-dashboard-totals__card">
            <span className="lm-dashboard-totals__label">{translate(`finance:dashboard.totals.${card.id}`)}</span>
            <Amount value={amount.current} tone={card.tone} emphasis className="lm-dashboard-totals__value" />
            <span className="lm-dashboard-totals__change">
              <DashboardChange
                changeRatio={amount.changeRatio}
                difference={amount.difference}
                as={card.changeAs}
                comparisonRange={comparisonRange}
              />
            </span>
          </div>
        )
      })}
    </section>
  )
}

export default DashboardTotals
