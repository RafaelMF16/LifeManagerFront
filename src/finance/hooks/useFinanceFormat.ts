import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { usePrivacyMode } from './usePrivacyMode'

const CURRENCY = 'BRL'
const MINUS_SIGN = '−'
const MONEY_MASK = '••••••'
const PERCENT_MASK = '••'

function capitalize(value: string) {
  return value.charAt(0).toLocaleUpperCase() + value.slice(1)
}

/**
 * The formatter's own layout (symbol, spacing, `%`) with the digits replaced by `mask`,
 * e.g. "R$ ••••••" in pt-BR and "$••••••" in en-US — so a hidden value reveals nothing, not even its length.
 */
function maskedLayout(formatter: Intl.NumberFormat, mask: string) {
  return formatter.formatToParts(0).reduce((text, part) => {
    if (part.type === 'currency' || part.type === 'percentSign' || part.type === 'literal') return text + part.value
    return text.endsWith(mask) ? text : text + mask
  }, '')
}

/**
 * Month names and money in the given language. With `hidden` (privacy mode), every amount and
 * percentage comes out masked: this is the one place money becomes text, so masking here covers every screen.
 */
export function createFinanceFormat(language: string, hidden: boolean) {
  const monthFormatter = new Intl.DateTimeFormat(language, { month: 'long', timeZone: 'UTC' })
  const moneyFormatter = new Intl.NumberFormat(language, { style: 'currency', currency: CURRENCY })

  const dayMonthFormatter = new Intl.DateTimeFormat(language, { day: 'numeric', month: 'short', timeZone: 'UTC' })
  const percentFormatter = new Intl.NumberFormat(language, { style: 'percent', maximumFractionDigits: 1 })

  const maskedMoney = maskedLayout(moneyFormatter, MONEY_MASK)
  const maskedPercent = maskedLayout(percentFormatter, PERCENT_MASK)

  const monthName = (month: number) => capitalize(monthFormatter.format(Date.UTC(2000, month - 1, 1)))

  return {
    monthName,
    /** "12 set" / "Sep 12" from an ISO `YYYY-MM-DD` date (no "de", no trailing dot). */
    dayLabel: (isoDate: string) => {
      const [year, month, day] = isoDate.split('-').map(Number)
      return dayMonthFormatter
        .formatToParts(Date.UTC(year, month - 1, day))
        .filter((part) => part.type === 'day' || part.type === 'month')
        .map((part) => part.value.replace('.', ''))
        .join(' ')
    },
    /** A 0–1 ratio as a percentage, e.g. 0.623 → "62,3%". */
    percent: (ratio: number) => (hidden ? maskedPercent : percentFormatter.format(ratio)),
    /** "Setembro 2026" / "September 2026". */
    periodLabel: (month: number, year: number) => `${monthName(month)} ${year}`,
    /** Unsigned amount, e.g. "R$ 1.200,00". */
    money: (value: number) => (hidden ? maskedMoney : moneyFormatter.format(Math.abs(value))),
    /** Signed amount with a true minus sign (U+2212) for negatives; masked without a sign, so it doesn't leak. */
    signedMoney: (value: number) =>
      hidden ? maskedMoney : `${value < 0 ? MINUS_SIGN : ''}${moneyFormatter.format(Math.abs(value))}`,
  }
}

/** Month names and money in the active UI language (Intl), so they follow the language switch and privacy mode. */
export function useFinanceFormat() {
  const { i18n } = useTranslation()
  const { hidden } = usePrivacyMode()
  const language = i18n.language

  return useMemo(() => createFinanceFormat(language, hidden), [language, hidden])
}
