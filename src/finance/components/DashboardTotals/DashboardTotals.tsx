import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useFinanceFormat } from '../../hooks/useFinanceFormat'
import { usePrivacyMode } from '../../hooks/usePrivacyMode'
import type { DashboardAmountDto, DashboardTotalsDto } from '../../types/DashboardDtos'
import Amount from '../Amount/Amount'
import DashboardChange from '../DashboardChange/DashboardChange'
import './DashboardTotals.css'

interface DashboardTotalsProps {
  totals: DashboardTotalsDto
  /** The comparison period, e.g. "Abr – Set 2025". */
  comparisonRange: string
}

type TotalId = 'income' | 'expense' | 'investment' | 'saved'

// `id` doubles as an i18next key lookup (`finance:dashboard.totals.${id}`).
const CARDS: { id: TotalId; tone: 'positive' | 'negative' | 'investment' | 'signed'; changeAs: 'percent' | 'money' }[] = [
  { id: 'income', tone: 'positive', changeAs: 'percent' },
  { id: 'expense', tone: 'negative', changeAs: 'percent' },
  { id: 'investment', tone: 'investment', changeAs: 'percent' },
  { id: 'saved', tone: 'signed', changeAs: 'money' },
]

/**
 * The period's income, expenses, investment and what was saved, each with how it moved against the comparison
 * period. Saved counts investment as saving, so it comes with its savings rate and split into invested and what
 * was left in the account (the month screens' balance).
 */
function DashboardTotals({ totals, comparisonRange }: DashboardTotalsProps) {
  const { t: translate } = useTranslation('finance')
  const { percent } = useFinanceFormat()
  const { hidden } = usePrivacyMode()
  const titleId = useId()

  return (
    <section className="lm-dashboard-totals" aria-labelledby={titleId}>
      <h2 id={titleId} className="lm-dashboard-totals__title">
        {translate('finance:dashboard.totals.label')}
      </h2>
      {CARDS.map((card) => {
        const amount: DashboardAmountDto = totals[card.id]
        const isSaved = card.id === 'saved'
        return (
          <div key={card.id} className="lm-dashboard-totals__card">
            <span className="lm-dashboard-totals__label">
              {translate(`finance:dashboard.totals.${card.id}`)}
              {isSaved && totals.savingsRate !== null ? (
                <span className="lm-dashboard-totals__rate lm-numeric">
                  <span className="lm-dashboard-totals__visually-hidden">
                    {translate('finance:dashboard.totals.savingsRate')}:{' '}
                  </span>
                  <span aria-hidden={hidden}>{percent(totals.savingsRate)}</span>
                  {hidden ? (
                    <span className="lm-dashboard-totals__visually-hidden">
                      {translate('finance:privacy.hiddenValue')}
                    </span>
                  ) : null}
                </span>
              ) : null}
            </span>
            <Amount value={amount.current} tone={card.tone} emphasis className="lm-dashboard-totals__value" />
            <span className="lm-dashboard-totals__change">
              <DashboardChange
                changeRatio={amount.changeRatio}
                difference={amount.difference}
                as={card.changeAs}
                comparisonRange={comparisonRange}
              />
            </span>
            {isSaved ? (
              <ul className="lm-dashboard-totals__split" aria-label={translate('finance:dashboard.totals.savedSplit')}>
                <li>
                  <Amount value={totals.investment.current} tone="investment" />{' '}
                  {translate('finance:dashboard.totals.savedInvested')}
                </li>
                <li>
                  <Amount value={totals.balance.current} tone="signed" />{' '}
                  {translate('finance:dashboard.totals.savedInAccount')}
                </li>
              </ul>
            ) : null}
          </div>
        )
      })}
    </section>
  )
}

export default DashboardTotals
