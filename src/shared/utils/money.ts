const CURRENCY = 'BRL'
export const MINUS_SIGN = '−'
const MONEY_MASK = '••••••'

/**
 * The formatter's own layout (symbol, spacing, `%`) with the digits replaced by `mask`,
 * e.g. "R$ ••••••" in pt-BR and "$••••••" in en-US — so a hidden value reveals nothing, not even its length.
 */
export function maskedLayout(formatter: Intl.NumberFormat, mask: string) {
  return formatter.formatToParts(0).reduce((text, part) => {
    if (part.type === 'currency' || part.type === 'percentSign' || part.type === 'literal') return text + part.value
    return text.endsWith(mask) ? text : text + mask
  }, '')
}

/**
 * Money (BRL) in the given language. With `hidden` (privacy mode) every amount comes out masked, without a sign.
 * Shared by every screen that shows money (Finance's `useFinanceFormat`, the Home), so they all mask the same way.
 */
export function createMoneyFormat(language: string, hidden: boolean) {
  const moneyFormatter = new Intl.NumberFormat(language, { style: 'currency', currency: CURRENCY })
  const maskedMoney = maskedLayout(moneyFormatter, MONEY_MASK)

  return {
    /** The mask itself, e.g. "R$ ••••••", for formats built elsewhere (compact amounts). */
    maskedMoney,
    /** Unsigned amount, e.g. "R$ 1.200,00". */
    money: (value: number) => (hidden ? maskedMoney : moneyFormatter.format(Math.abs(value))),
    /** Signed amount with a true minus sign (U+2212) for negatives; masked without a sign, so it doesn't leak. */
    signedMoney: (value: number) =>
      hidden ? maskedMoney : `${value < 0 ? MINUS_SIGN : ''}${moneyFormatter.format(Math.abs(value))}`,
  }
}
