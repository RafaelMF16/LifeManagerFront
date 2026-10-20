/** A bank line as read from the file, before it is sent to `POST /api/StatementImports`. */
export interface StatementLineInput {
  /** `YYYY-MM-DD`. */
  date: string
  description: string
  /** With the statement's sign: negative when money left the account. */
  amount: number
  /** The bank's id of the line (OFX `FITID`), when the file has one. */
  fitid: string | null
}

/** Why a file couldn't be read; each reason has a message under `finance:imports.upload.errors`. */
export type StatementFileErrorReason = 'unsupported' | 'tooLarge' | 'notOfx' | 'noTransactions' | 'emptyCsv'

export class StatementFileError extends Error {
  readonly reason: StatementFileErrorReason

  constructor(reason: StatementFileErrorReason) {
    super(`Statement file error: ${reason}`)
    this.name = 'StatementFileError'
    this.reason = reason
  }
}

export function isStatementFileError(error: unknown): error is StatementFileError {
  return error instanceof StatementFileError
}

// Espelha StatementImport.MaxLines e as regras de data/valor de StatementImportRow.Create (LifeManager.Domain).
export const STATEMENT_MAX_LINES = 5000
const MIN_DATE = '2000-01-01'

/**
 * The lines the backend would refuse are left out before sending (with a count for the user), instead of failing
 * the whole file: dates before 2000 or after today (card statements list future installments) and zero amounts.
 */
export function keepImportableLines(lines: StatementLineInput[], today: string) {
  const kept = lines.filter((line) => line.amount !== 0 && line.date >= MIN_DATE && line.date <= today)
  return { lines: kept, skippedCount: lines.length - kept.length }
}

/** Today's date in the browser, `YYYY-MM-DD` (the backend checks again with its own clock). */
export function todayIso(now = new Date()) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/** Whether `year`-`month`-`day` is a real calendar day, e.g. not 2024-02-30. */
export function isValidDay(year: number, month: number, day: number) {
  if (month < 1 || month > 12 || day < 1) return false
  return day <= new Date(Date.UTC(year, month, 0)).getUTCDate()
}

export function toIsoDate(year: number, month: number, day: number) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${year}-${pad(month)}-${pad(day)}`
}
