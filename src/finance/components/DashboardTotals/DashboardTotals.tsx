import { useId } from 'react'
import type { ReactNode } from 'react'
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

type CardTone = 'positive' | 'negative' | 'investment' | 'signed'

// The money flows, alike: `id` doubles as an i18next key lookup (`finance:dashboard.totals.${id}`).
const FLOW_CARDS: { id: 'income' | 'expense' | 'investment'; tone: CardTone }[] = [
  { id: 'income', tone: 'positive' },
  { id: 'expense', tone: 'negative' },
  { id: 'investment', tone: 'investment' },
]

interface TotalCardProps {
  label: string
  amount: DashboardAmountDto
  tone: CardTone
  changeAs: 'percent' | 'money'
  comparisonRange: string
  /** Shown on the label's line, after it. */
  badge?: ReactNode
  /** Shown under the change. */
  footer?: ReactNode
}

function TotalCard({ label, amount, tone, changeAs, comparisonRange, badge, footer }: TotalCardProps) {
  return (
    <div className="lm-dashboard-totals__card">
      <span className="lm-dashboard-totals__label">
        {label}
        {badge}
      </span>
      <Amount value={amount.current} tone={tone} emphasis className="lm-dashboard-totals__value" />
      <span className="lm-dashboard-totals__change">
        <DashboardChange
          changeRatio={amount.changeRatio}
          difference={amount.difference}
          as={changeAs}
          comparisonRange={comparisonRange}
        />
      </span>
      {footer}
    </div>
  )
}

/**
 * The period's income, expenses, investment and what was saved, each with how it moved against the comparison
 * period. Saved counts investment as saving, so it comes with its savings rate and split into invested and what
 * was left in the account (the month screens' balance). Its change is in money: a percentage of a negative or
 * tiny figure would mislead.
 */
function DashboardTotals({ totals, comparisonRange }: DashboardTotalsProps) {
  const { t: translate } = useTranslation('finance')
  const { savingsRate } = useFinanceFormat()
  const { hidden } = usePrivacyMode()
  const titleId = useId()

  const savingsRateBadge =
    totals.savingsRate === null ? null : (
      <span className="lm-dashboard-totals__rate lm-numeric">
        <span className="lm-dashboard-totals__visually-hidden">
          {translate('finance:dashboard.totals.savingsRate')}:{' '}
        </span>
        <span aria-hidden={hidden || undefined}>{savingsRate(totals.savingsRate)}</span>
        {hidden ? (
          <span className="lm-dashboard-totals__visually-hidden">{translate('finance:privacy.hiddenValue')}</span>
        ) : null}
      </span>
    )

  const savedSplit = (
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
  )

  return (
    <section className="lm-dashboard-totals" aria-labelledby={titleId}>
      <h2 id={titleId} className="lm-dashboard-totals__title">
        {translate('finance:dashboard.totals.label')}
      </h2>
      {FLOW_CARDS.map((card) => (
        <TotalCard
          key={card.id}
          label={translate(`finance:dashboard.totals.${card.id}`)}
          amount={totals[card.id]}
          tone={card.tone}
          changeAs="percent"
          comparisonRange={comparisonRange}
        />
      ))}
      <TotalCard
        label={translate('finance:dashboard.totals.saved')}
        amount={totals.saved}
        tone="signed"
        changeAs="money"
        comparisonRange={comparisonRange}
        badge={savingsRateBadge}
        footer={savedSplit}
      />
    </section>
  )
}

export default DashboardTotals
