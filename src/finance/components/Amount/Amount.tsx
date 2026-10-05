import { useTranslation } from 'react-i18next'
import { useFinanceFormat } from '../../hooks/useFinanceFormat'
import { usePrivacyMode } from '../../hooks/usePrivacyMode'
import './Amount.css'

type AmountTone = 'positive' | 'negative' | 'signed' | 'investment'

interface AmountProps {
  value: number
  /**
   * `positive`/`negative` color a value by what it is (income, expense) and show no sign;
   * `signed` colors by the value's own sign and shows a minus when negative (balances);
   * `investment` is always the investment color and shows the value's own sign (a list passes it negative,
   * as money leaving the account; a total passes it positive).
   * Zero is always neutral: no money moved, so there is nothing to color.
   */
  tone: AmountTone
  /** `compact` shortens it for tight spots ("R$ 1,2 mil"). */
  notation?: 'standard' | 'compact'
  emphasis?: boolean
  className?: string
}

/** The one way to render money: tabular figures, semantic color reserved for money in, out and invested. */
function Amount({ value, tone, notation = 'standard', emphasis = false, className }: AmountProps) {
  const { t: translate } = useTranslation('finance')
  const { money, signedMoney, compactMoney, signedCompactMoney } = useFinanceFormat()
  const { hidden } = usePrivacyMode()

  // Hidden amounts go neutral: a green/red balance would still tell whether it is positive.
  const color = hidden ? 'hidden' : value === 0 ? 'zero' : tone === 'signed' ? (value < 0 ? 'negative' : 'positive') : tone
  const classes = ['lm-amount', 'lm-numeric', `lm-amount--${color}`, emphasis && 'lm-amount--emphasis', className]
    .filter(Boolean)
    .join(' ')

  if (hidden) {
    // The mask is noise to a screen reader ("bullet bullet…"): it hears "Hidden amount" instead.
    return (
      <span className={classes}>
        <span aria-hidden="true">{money(value)}</span>
        <span className="lm-amount__visually-hidden">{translate('finance:privacy.hiddenValue')}</span>
      </span>
    )
  }

  const showsSign = tone === 'signed' || tone === 'investment'
  const compact = notation === 'compact'
  const text = showsSign
    ? (compact ? signedCompactMoney : signedMoney)(value)
    : (compact ? compactMoney : money)(value)

  return <span className={classes}>{text}</span>
}

export default Amount
