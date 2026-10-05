import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { usePrivacyMode } from './usePrivacyMode'

const CURRENCY = 'BRL'
const MINUS_SIGN = '−'
const MONEY_MASK = '••••••'
const PERCENT_MASK = '••'
/** Changes beyond ±999% read as noise; they show capped (">+999%"). */
const CHANGE_RATIO_CAP = 9.99

function capitalize(value: string) {
  return value.charAt(0).toLocaleUpperCase() + value.slice(1)
}

/** "2026-09" → { year: 2026, month: 9 }. */
function parseYearMonth(value: string) {
  const [year, month] = value.split('-').map(Number)
  return { year, month }
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
  const compactMoneyFormatter = new Intl.NumberFormat(language, {
    style: 'currency',
    currency: CURRENCY,
    notation: 'compact',
    maximumFractionDigits: 1,
  })
  const shortMonthFormatter = new Intl.DateTimeFormat(language, { month: 'short', timeZone: 'UTC' })

  const maskedMoney = maskedLayout(moneyFormatter, MONEY_MASK)
  const maskedPercent = maskedLayout(percentFormatter, PERCENT_MASK)

  const monthName = (month: number) => capitalize(monthFormatter.format(Date.UTC(2000, month - 1, 1)))
  const shortMonthName = (month: number) =>
    capitalize(shortMonthFormatter.format(Date.UTC(2000, month - 1, 1)).replace('.', ''))
  const compactMoney = (value: number) => (hidden ? maskedMoney : compactMoneyFormatter.format(Math.abs(value)))

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
    /** Short unsigned amount for tight spots (chart axes), e.g. "R$ 1,2 mil" / "R$1.2K". */
    compactMoney,
    /** `compactMoney` with a true minus sign for negatives. */
    signedCompactMoney: (value: number) => (hidden ? maskedMoney : `${value < 0 ? MINUS_SIGN : ''}${compactMoney(value)}`),
    /** A change ratio with its sign, e.g. 0.12 → "+12%", −0.05 → "−5%"; capped at ±999%. */
    signedPercent: (ratio: number) => {
      if (hidden) return maskedPercent
      const sign = ratio > 0 ? '+' : ratio < 0 ? MINUS_SIGN : ''
      const capped = Math.abs(ratio) > CHANGE_RATIO_CAP
      return `${capped ? '>' : ''}${sign}${percentFormatter.format(Math.min(Math.abs(ratio), CHANGE_RATIO_CAP))}`
    },
    /** "Set" / "Sep". */
    shortMonthName,
    /** A run of months from `yyyy-MM` bounds: "Set 2026", "Abr – Set 2026" or "Nov 2025 – Jan 2026". */
    rangeLabel: (from: string, to: string) => {
      const start = parseYearMonth(from)
      const end = parseYearMonth(to)
      if (start.year === end.year && start.month === end.month) return `${shortMonthName(start.month)} ${start.year}`
      if (start.year === end.year) return `${shortMonthName(start.month)} – ${shortMonthName(end.month)} ${end.year}`
      return `${shortMonthName(start.month)} ${start.year} – ${shortMonthName(end.month)} ${end.year}`
    },
  }
}

/** Month names and money in the active UI language (Intl), so they follow the language switch and privacy mode. */
export function useFinanceFormat() {
  const { i18n } = useTranslation()
  const { hidden } = usePrivacyMode()
  const language = i18n.language

  return useMemo(() => createFinanceFormat(language, hidden), [language, hidden])
}
