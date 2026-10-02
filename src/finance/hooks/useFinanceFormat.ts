import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const CURRENCY = 'BRL'
const MINUS_SIGN = '−'

function capitalize(value: string) {
  return value.charAt(0).toLocaleUpperCase() + value.slice(1)
}

/** Month names and money in the active UI language (Intl), so they follow the language switch. */
export function useFinanceFormat() {
  const { i18n } = useTranslation()
  const language = i18n.language

  return useMemo(() => {
    const monthFormatter = new Intl.DateTimeFormat(language, { month: 'long', timeZone: 'UTC' })
    const moneyFormatter = new Intl.NumberFormat(language, { style: 'currency', currency: CURRENCY })

    const dayMonthFormatter = new Intl.DateTimeFormat(language, { day: 'numeric', month: 'short', timeZone: 'UTC' })
    const percentFormatter = new Intl.NumberFormat(language, { style: 'percent', maximumFractionDigits: 1 })

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
      percent: (ratio: number) => percentFormatter.format(ratio),
      /** "Setembro 2026" / "September 2026". */
      periodLabel: (month: number, year: number) => `${monthName(month)} ${year}`,
      /** Unsigned amount, e.g. "R$ 1.200,00". */
      money: (value: number) => moneyFormatter.format(Math.abs(value)),
      /** Signed amount with a true minus sign (U+2212) for negatives. */
      signedMoney: (value: number) => `${value < 0 ? MINUS_SIGN : ''}${moneyFormatter.format(Math.abs(value))}`,
    }
  }, [language])
}
