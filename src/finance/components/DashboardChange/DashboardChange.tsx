import { useTranslation } from 'react-i18next'
import Icon from '../../../shared/components/Icon/Icon'
import { useFinanceFormat } from '../../hooks/useFinanceFormat'
import { usePrivacyMode } from '../../hooks/usePrivacyMode'
import './DashboardChange.css'

interface DashboardChangeProps {
  /** Relative change (0.12 = +12%); null when the comparison period had nothing. */
  changeRatio: number | null
  /** Absolute change, used instead of the ratio when `as="money"`. */
  difference: number
  /**
   * `percent` for flows (income, expenses, investment); `money` for the balance, where a percentage of a
   * negative or tiny balance would mislead.
   */
  as?: 'percent' | 'money'
  /** The comparison period, e.g. "Abr – Set 2025", for the screen-reader sentence. */
  comparisonRange: string
}

/**
 * How a figure moved against the comparison period. Neutral on purpose: money colors are reserved for
 * money in/out, and "up" is good for income but bad for expenses — the arrow and the sign carry the direction.
 */
function DashboardChange({ changeRatio, difference, as = 'percent', comparisonRange }: DashboardChangeProps) {
  const { t: translate } = useTranslation('finance')
  const { signedPercent, signedMoney } = useFinanceFormat()
  const { hidden } = usePrivacyMode()

  if (hidden) {
    // The arrow alone would tell whether the figure went up or down, so it goes too.
    return (
      <span className="lm-dashboard-change">
        <span aria-hidden="true">{as === 'money' ? signedMoney(difference) : signedPercent(0)}</span>
        <span className="lm-dashboard-change__visually-hidden">{translate('finance:dashboard.change.hidden')}</span>
      </span>
    )
  }

  const direction = as === 'money' ? Math.sign(difference) : changeRatio === null ? null : Math.sign(changeRatio)

  if (direction === null) {
    return (
      <span className="lm-dashboard-change">
        <span aria-hidden="true">—</span>
        <span className="lm-dashboard-change__visually-hidden">
          {translate('finance:dashboard.change.none', { range: comparisonRange })}
        </span>
      </span>
    )
  }

  const value = as === 'money' ? signedMoney(difference) : signedPercent(changeRatio ?? 0)
  const sentence =
    direction > 0
      ? translate('finance:dashboard.change.up', { value, range: comparisonRange })
      : direction < 0
        ? translate('finance:dashboard.change.down', { value, range: comparisonRange })
        : translate('finance:dashboard.change.same', { range: comparisonRange })

  return (
    <span className="lm-dashboard-change">
      <Icon
        name={direction > 0 ? 'trending-up' : direction < 0 ? 'trending-down' : 'minus'}
        size={14}
        aria-hidden="true"
        className="lm-dashboard-change__icon"
      />
      <span className="lm-numeric" aria-hidden="true">
        {value}
      </span>
      <span className="lm-dashboard-change__visually-hidden">{sentence}</span>
    </span>
  )
}

export default DashboardChange
