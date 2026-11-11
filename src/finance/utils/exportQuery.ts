import type { SupportedLanguage } from '../../shared/i18n/languages'
import type { ExportFormat, ExportFormValues } from '../validation/exportSchema'
import { addMonths, toYearMonth } from './yearMonth'

/** How many months the dialog offers by default: the last 12, through the current one. */
export const EXPORT_DEFAULT_MONTHS = 12

/** `GET /api/Transactions/Export`'s path with its query string. */
export function exportPath(values: ExportFormValues): string {
  const params = new URLSearchParams({ from: values.from, to: values.to, type: values.type, format: values.format })
  return `/api/Transactions/Export?${params.toString()}`
}

/** The last 12 months through `today`'s (`yyyy-MM`). */
export function defaultExportPeriod(today: Date): { from: string; to: string } {
  const to = toYearMonth(today)
  return { from: addMonths(to, -(EXPORT_DEFAULT_MONTHS - 1)), to }
}

/** The spreadsheet that fits the interface's language: Brazilian Excel in Portuguese, the English one otherwise. */
export function exportFormatFor(language: SupportedLanguage | string): ExportFormat {
  return language.toLowerCase().startsWith('pt') ? 'PtBr' : 'EnUs'
}

/** The file's name when the response doesn't say: the backend's own pattern. */
export function exportFallbackFileName(values: Pick<ExportFormValues, 'from' | 'to' | 'format'>): string {
  return `${values.format === 'EnUs' ? 'transactions' : 'lancamentos'}-${values.from}_${values.to}.csv`
}

/** The `X-Row-Count` header as a number; null when missing or unreadable (then the file is saved anyway). */
export function parseRowCount(header: string | null): number | null {
  if (header === null || header.trim() === '') return null

  const value = Number(header)
  return Number.isInteger(value) && value >= 0 ? value : null
}
