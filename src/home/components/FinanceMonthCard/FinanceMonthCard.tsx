import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Button from '../../../shared/components/Button/Button'
import PrivacyToggle from '../../../shared/components/PrivacyToggle/PrivacyToggle'
import { usePrivacyMode } from '../../../shared/hooks/usePrivacyMode'
import { createMoneyFormat } from '../../../shared/utils/money'
import type { HomeOverviewStatus } from '../../hooks/useHomeOverview'
import type { HomeOverviewDto } from '../../types/HomeOverview'
import { financeCardState, monthName } from '../../utils/overviewCopy'
import HomeCard from '../HomeCard/HomeCard'
import PrivateText from '../PrivateText/PrivateText'
import './FinanceMonthCard.css'

/**
 * From this share of the limit on, the budget bar warns: the same as the budget screen's `NEAR_LIMIT_RATIO`
 * (`finance/utils/budgetStatus.ts`), which `home/` can't import. Change both together.
 */
const NEAR_LIMIT_RATIO = 0.8

interface FinanceMonthCardProps {
  overview: HomeOverviewDto | null
  status: HomeOverviewStatus
  onRetry: () => void
}

/** The Home's finance card: the current month's balance, income and expenses, and its budget. Follows privacy mode. */
function FinanceMonthCard({ overview, status, onRetry }: FinanceMonthCardProps) {
  const { t: translate, i18n } = useTranslation('home')
  const navigate = useNavigate()
  const { hidden } = usePrivacyMode()
  const format = useMemo(() => createMoneyFormat(i18n.language, hidden), [i18n.language, hidden])
  const state = overview ? financeCardState(overview.finance) : null
  const month = overview ? monthName(overview.finance.month, i18n.language) : ''
  const hiddenValue = translate('common:privacy.hiddenValue')

  const actions = (
    <>
      {/* Months opens the quick-entry form on arrival (`?new=1`), which opens a missing month by itself. */}
      <Button icon="plus" onClick={() => navigate('/finance/months?new=1')}>
        {translate('finance.newTransaction')}
      </Button>
      {state?.kind === 'month' ? (
        <Button variant="secondary" iconRight="chevron-right" onClick={() => navigate(`/finance/months/${state.monthlySummaryId}`)}>
          {translate('finance.viewMonth')}
        </Button>
      ) : (
        <Button variant="secondary" iconRight="chevron-right" onClick={() => navigate('/finance')}>
          {translate('finance.goToFinance')}
        </Button>
      )}
    </>
  )

  const budget = state?.kind === 'month' ? state.budget : null
  const budgetTone = hidden ? 'hidden' : budget?.over ? 'over' : budget && budget.barRatio >= NEAR_LIMIT_RATIO ? 'near' : 'ok'

  return (
    <HomeCard
      id="finance"
      icon="wallet"
      title={overview ? translate('finance.title', { month }) : translate('finance.titleLoading')}
      status={status}
      loadingLabel={translate('finance.loading')}
      onRetry={onRetry}
      headerAction={<PrivacyToggle />}
      actions={actions}
      announceError={false}
      tourTarget="home.finance"
    >
      {state?.kind === 'noMonth' ? (
        <p className="lm-home-card__line">{translate('finance.noMonth', { month })}</p>
      ) : state?.kind === 'month' ? (
        <>
          <div className="lm-finance-month-card__balance">
            <span className="lm-finance-month-card__label">{translate('finance.balance')}</span>
            <span className="lm-finance-month-card__balance-value">
              <PrivateText hidden={hidden} hiddenLabel={hiddenValue}>
                {format.signedMoney(state.balance)}
              </PrivateText>
            </span>
          </div>

          <dl className="lm-finance-month-card__flows">
            <div>
              <dt>{translate('finance.income')}</dt>
              <dd className={hidden ? undefined : 'lm-finance-month-card__income'}>
                <PrivateText hidden={hidden} hiddenLabel={hiddenValue}>
                  {format.money(state.income)}
                </PrivateText>
              </dd>
            </div>
            <div>
              <dt>{translate('finance.expense')}</dt>
              <dd className={hidden ? undefined : 'lm-finance-month-card__expense'}>
                <PrivateText hidden={hidden} hiddenLabel={hiddenValue}>
                  {format.money(state.expense)}
                </PrivateText>
              </dd>
            </div>
          </dl>

          {budget ? (
            <div className={`lm-finance-month-card__budget lm-finance-month-card__budget--${budgetTone}`}>
              <p className="lm-home-card__line">
                <PrivateText hidden={hidden} hiddenLabel={translate('finance.budgetHidden')}>
                  {translate('finance.budget', { spent: format.money(budget.spent), limit: format.money(budget.limit) })}
                </PrivateText>
              </p>
              <div
                className="lm-home-card__bar"
                role="progressbar"
                aria-label={translate('finance.budgetLabel')}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={hidden ? undefined : Math.round(budget.barRatio * 100)}
                aria-valuetext={hidden ? translate('common:privacy.hiddenValue') : undefined}
              >
                {/* Privacy mode: a full, neutral bar that tells nothing about the spending. */}
                <div className="lm-home-card__bar-fill" style={{ width: `${hidden ? 100 : Math.round(budget.barRatio * 100)}%` }} />
              </div>
              {budget.tightest ? (
                <p className="lm-home-card__line">
                  <PrivateText hidden={hidden} hiddenLabel={translate('finance.tightest', { name: budget.tightest.name, percent: hiddenValue })}>
                    {translate('finance.tightest', { name: budget.tightest.name, percent: format.percent(budget.tightest.ratio) })}
                  </PrivateText>
                </p>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </HomeCard>
  )
}

export default FinanceMonthCard
