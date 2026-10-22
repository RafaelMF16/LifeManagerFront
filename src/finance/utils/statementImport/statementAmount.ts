export type DecimalSeparator = ',' | '.'

const DIGITS_AND_SEPARATORS = /^[\d.,]+$/

/**
 * Reads a bank statement amount, keeping its sign: "-42,90", "-42.90", "1.234,56", "1,234.56", "R$ -1.000,00",
 * "(42,90)" and "42,90-" (both negative). With `decimalSeparator` the other character is a thousands separator;
 * without it, the last separator is the decimal one when both appear, and a single separator that appears once
 * is decimal ("1,5" and "1.5"). Returns null when it isn't a number.
 */
export function parseStatementAmount(value: string, decimalSeparator?: DecimalSeparator): number | null {
  let text = value.replace(/[\s ]/g, '').replace(/R\$/gi, '')
  if (text === '') return null

  let negative = false
  if (text.startsWith('(') && text.endsWith(')')) {
    negative = true
    text = text.slice(1, -1)
  }
  if (text.startsWith('-') || text.startsWith('−')) {
    negative = !negative
    text = text.slice(1)
  } else if (text.endsWith('-')) {
    negative = !negative
    text = text.slice(0, -1)
  } else if (text.startsWith('+')) {
    text = text.slice(1)
  }

  if (!DIGITS_AND_SEPARATORS.test(text) || !/\d/.test(text)) return null

  const separator = decimalSeparator ?? guessDecimalSeparator(text)
  const thousands = separator === ',' ? '.' : ','
  const parts = text.replaceAll(thousands, '').split(separator)
  if (parts.length > 2) return null

  const amount = Number(parts.length === 2 ? `${parts[0] || '0'}.${parts[1]}` : parts[0])
  if (!Number.isFinite(amount)) return null

  // Cents are kept exact: statements never carry more than two decimals that matter.
  const rounded = Math.round(amount * 100) / 100
  return negative && rounded !== 0 ? -rounded : rounded
}

/** The decimal separator of one amount written without a known locale, as described in `parseStatementAmount`. */
function guessDecimalSeparator(text: string): DecimalSeparator {
  const lastComma = text.lastIndexOf(',')
  const lastDot = text.lastIndexOf('.')

  if (lastComma !== -1 && lastDot !== -1) return lastComma > lastDot ? ',' : '.'
  if (lastComma !== -1) return text.indexOf(',') === lastComma ? ',' : '.'
  if (lastDot !== -1) return text.indexOf('.') === lastDot ? '.' : ','
  return '.'
}

/**
 * The decimal separator most of the column's values use: a value ending in ",dd" or ",d" counts for the comma,
 * ".dd" or ".d" for the dot. Ties (or no evidence) go to the comma, the Brazilian convention.
 */
export function detectDecimalSeparator(values: string[]): DecimalSeparator {
  let comma = 0
  let dot = 0

  for (const value of values) {
    const text = value.replace(/[\s )-]/g, '')
    if (/,\d{1,2}$/.test(text)) comma++
    else if (/\.\d{1,2}$/.test(text)) dot++
  }

  return dot > comma ? '.' : ','
}
