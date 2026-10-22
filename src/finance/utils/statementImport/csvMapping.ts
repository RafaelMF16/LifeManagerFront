import { detectDecimalSeparator, parseStatementAmount } from './statementAmount'
import type { DecimalSeparator } from './statementAmount'
import { isValidDay, toIsoDate } from './statementLines'
import type { StatementLineInput } from './statementLines'

export type CsvDateFormat = 'dmy' | 'ymd' | 'mdy'
export type CsvAmountMode = 'single' | 'split'

/** Which column holds what, and how its values are written. Column indexes are 0-based; -1 means "none". */
export interface CsvMapping {
  hasHeader: boolean
  dateColumn: number
  descriptionColumn: number
  amountMode: CsvAmountMode
  /** `single`: one signed column. */
  amountColumn: number
  /** `split`: money out and money in in separate columns (both read as positive). */
  debitColumn: number
  creditColumn: number
  dateFormat: CsvDateFormat
  decimalSeparator: DecimalSeparator
  /** Card statements often list purchases as positive: flipping the sign makes them money out. */
  invertSign: boolean
}

const SAMPLE_ROWS = 30

const HEADER_NAMES = {
  date: ['data', 'date', 'dt', 'data lancamento', 'data do lancamento', 'data da transacao', 'data movimento'],
  description: ['descricao', 'description', 'historico', 'title', 'titulo', 'lancamento', 'estabelecimento', 'memo', 'detalhes', 'nome'],
  amount: ['valor', 'amount', 'value', 'quantia', 'valor (r$)', 'valor r$', 'montante'],
  debit: ['debito', 'debit', 'saida', 'saidas', 'valor debito'],
  credit: ['credito', 'credit', 'entrada', 'entradas', 'valor credito'],
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

/** Reads a date in the given format: "05/03/2024", "5-3-24", "2024-03-05", "2024/03/05 10:00". */
export function parseCsvDate(value: string, format: CsvDateFormat): string | null {
  const match = /^(\d{1,4})[/.-](\d{1,2})[/.-](\d{1,4})/.exec(value.trim())
  if (!match) return null

  const [first, second, third] = match.slice(1).map(Number)
  const [year, month, day] =
    format === 'ymd' ? [first, second, third] : format === 'mdy' ? [third, first, second] : [third, second, first]
  const fullYear = year < 100 ? 2000 + year : year

  return isValidDay(fullYear, month, day) ? toIsoDate(fullYear, month, day) : null
}

function looksLikeDate(value: string) {
  return /^\d{1,4}[/.-]\d{1,2}[/.-]\d{1,4}/.test(value.trim())
}

function looksLikeAmount(value: string) {
  return !looksLikeDate(value) && /\d/.test(value) && parseStatementAmount(value) !== null
}

/** "2024-03-05" reads as year first; with slashes, a first part over 12 means day first and a second over 12 month first. */
function detectDateFormat(values: string[]): CsvDateFormat {
  let dayFirst = false
  let monthFirst = false

  for (const value of values) {
    const match = /^(\d{1,4})[/.-](\d{1,2})[/.-](\d{1,4})/.exec(value.trim())
    if (!match) continue
    if (match[1].length === 4) return 'ymd'

    if (Number(match[1]) > 12) dayFirst = true
    if (Number(match[2]) > 12) monthFirst = true
  }

  return monthFirst && !dayFirst ? 'mdy' : 'dmy'
}

function columnByName(header: string[], names: string[], taken: number[]) {
  const normalized = header.map(normalize)
  const exact = normalized.findIndex((cell, index) => !taken.includes(index) && names.includes(cell))
  if (exact !== -1) return exact

  return normalized.findIndex((cell, index) => !taken.includes(index) && names.some((name) => cell.startsWith(name)))
}

/** The column where most sample values pass `test`, or -1. */
function columnByContent(rows: string[][], columnCount: number, test: (value: string) => boolean, taken: number[]) {
  let best = { column: -1, hits: 0 }

  for (let column = 0; column < columnCount; column++) {
    if (taken.includes(column)) continue
    const hits = rows.filter((row) => test(row[column] ?? '')).length
    if (hits > best.hits) best = { column, hits }
  }

  return best.hits >= Math.ceil(rows.length / 2) ? best.column : -1
}

/** The remaining column with the longest texts: banks' descriptions are the wordiest cell of a line. */
function longestTextColumn(rows: string[][], columnCount: number, taken: number[]) {
  let best = { column: -1, length: 0 }

  for (let column = 0; column < columnCount; column++) {
    if (taken.includes(column)) continue
    const length = rows.reduce((total, row) => total + (row[column] ?? '').length, 0)
    if (length > best.length) best = { column, length }
  }

  return best.column
}

/**
 * Guesses the mapping from the file: a header row is recognized by having no date in it while the next row does;
 * columns are found by their header names (Portuguese or English), then by what their values look like.
 */
export function guessMapping(rows: string[][]): CsvMapping {
  const columnCount = Math.max(...rows.map((row) => row.length))
  const hasHeader = rows.length > 1 && !rows[0].some(looksLikeDate) && rows[1].some(looksLikeDate)
  const header = hasHeader ? rows[0] : []
  const sample = (hasHeader ? rows.slice(1) : rows).slice(0, SAMPLE_ROWS)

  const taken: number[] = []
  const pick = (column: number) => {
    if (column !== -1) taken.push(column)
    return column
  }
  const byName = (names: string[]) => (hasHeader ? columnByName(header, names, taken) : -1)
  const orElse = (column: number, fallback: () => number) => (column !== -1 ? column : fallback())

  const dateColumn = pick(orElse(byName(HEADER_NAMES.date), () => columnByContent(sample, columnCount, looksLikeDate, taken)))

  // Separate debit and credit columns first: "Valor Débito" also starts with "valor".
  let amountMode: CsvAmountMode = 'single'
  let debitColumn = byName(HEADER_NAMES.debit)
  let creditColumn = debitColumn === -1 ? -1 : columnByName(header, HEADER_NAMES.credit, [...taken, debitColumn])
  let amountColumn = -1

  if (debitColumn !== -1 && creditColumn !== -1) {
    amountMode = 'split'
    pick(debitColumn)
    pick(creditColumn)
  } else {
    debitColumn = -1
    creditColumn = -1
    amountColumn = pick(orElse(byName(HEADER_NAMES.amount), () => columnByContent(sample, columnCount, looksLikeAmount, taken)))
  }

  const descriptionColumn = pick(orElse(byName(HEADER_NAMES.description), () => longestTextColumn(sample, columnCount, taken)))

  const amountValues =
    amountMode === 'split'
      ? sample.flatMap((row) => [row[debitColumn] ?? '', row[creditColumn] ?? ''])
      : sample.map((row) => row[amountColumn] ?? '')

  return {
    hasHeader,
    dateColumn,
    descriptionColumn,
    amountMode,
    amountColumn,
    debitColumn,
    creditColumn,
    dateFormat: detectDateFormat(sample.map((row) => row[dateColumn] ?? '')),
    decimalSeparator: detectDecimalSeparator(amountValues.filter((value) => value !== '')),
    invertSign: false,
  }
}

/** Whether every column the mapping needs is chosen. */
export function isMappingComplete(mapping: CsvMapping) {
  const amountReady = mapping.amountMode === 'single' ? mapping.amountColumn !== -1 : mapping.debitColumn !== -1 && mapping.creditColumn !== -1
  return mapping.dateColumn !== -1 && mapping.descriptionColumn !== -1 && amountReady
}

function readAmount(row: string[], mapping: CsvMapping): number | null {
  const read = (column: number) => {
    const value = (row[column] ?? '').trim()
    return value === '' ? 0 : parseStatementAmount(value, mapping.decimalSeparator)
  }

  let amount: number | null
  if (mapping.amountMode === 'single') {
    amount = (row[mapping.amountColumn] ?? '').trim() === '' ? null : read(mapping.amountColumn)
  } else {
    const debit = read(mapping.debitColumn)
    const credit = read(mapping.creditColumn)
    amount = debit === null || credit === null ? null : Math.abs(credit) - Math.abs(debit)
  }

  if (amount === null) return null
  return mapping.invertSign ? -amount : amount
}

/**
 * The file's lines under the mapping. Rows whose date or amount can't be read (totals, balance lines, footers) are
 * counted in `unreadableCount` and left out.
 */
export function applyMapping(rows: string[][], mapping: CsvMapping) {
  const dataRows = mapping.hasHeader ? rows.slice(1) : rows
  const lines: StatementLineInput[] = []
  let unreadableCount = 0

  for (const row of dataRows) {
    const date = parseCsvDate(row[mapping.dateColumn] ?? '', mapping.dateFormat)
    const amount = readAmount(row, mapping)
    if (date === null || amount === null) {
      unreadableCount++
      continue
    }

    lines.push({ date, description: (row[mapping.descriptionColumn] ?? '').trim(), amount: Math.round(amount * 100) / 100, fitid: null })
  }

  return { lines, unreadableCount }
}

// ---------- Remembered mappings (per device: only column choices, never statement data) ----------

const STORAGE_KEY = 'lm-finance-csv-mappings'
const MAX_REMEMBERED = 20

/** Identifies a bank's CSV layout by its header (or its column count when it has none). */
export function layoutSignature(rows: string[][], hasHeader: boolean) {
  const columnCount = Math.max(...rows.map((row) => row.length))
  return hasHeader ? rows[0].map(normalize).join('|') : `columns:${columnCount}`
}

function readRemembered(): Record<string, CsvMapping> {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as unknown
    return stored && typeof stored === 'object' ? (stored as Record<string, CsvMapping>) : {}
  } catch {
    return {}
  }
}

export function loadRememberedMapping(signature: string): CsvMapping | null {
  return readRemembered()[signature] ?? null
}

export function rememberMapping(signature: string, mapping: CsvMapping) {
  try {
    const remembered = readRemembered()
    delete remembered[signature]
    // Newest last; the oldest layouts are forgotten past the limit.
    const entries = [...Object.entries(remembered), [signature, mapping] as const].slice(-MAX_REMEMBERED)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(entries)))
  } catch {
    // Storage unavailable (private mode, quota): the mapping is just not remembered.
  }
}
