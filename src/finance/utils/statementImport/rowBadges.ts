import type { StatementImportRowDto, SuggestionConfidence, SuggestionSource } from '../../types/StatementImportDtos'

/** Filed by what the bank wrote (an investment movement, a transfer between the user's own accounts), not by history. */
export type DetectionSource = Extract<SuggestionSource, 'InvestmentApplication' | 'InvestmentRedemption' | 'OwnTransfer'>
type LearnedSource = Extract<SuggestionSource, 'Rule' | 'History' | 'Similar'>

const DETECTION_SOURCES: readonly SuggestionSource[] = ['InvestmentApplication', 'InvestmentRedemption', 'OwnTransfer']

export function isDetectionSource(source: SuggestionSource): source is DetectionSource {
  return DETECTION_SOURCES.includes(source)
}

export type SuggestionBadge =
  | { kind: 'detected'; source: DetectionSource }
  | { kind: 'ignoredBefore' }
  | { kind: 'learned'; source: LearnedSource; confidence: SuggestionConfidence; uses: number }

/** Whether the row is still filed as the backend suggested: once the user edits it, it shows no suggestion badge. */
function isSuggested(row: StatementImportRowDto) {
  return row.suggestionSource !== 'None' && !row.editedByUser
}

/** The badge that explains how the row came filed, or null when it came as the bank's sign alone. */
export function suggestionBadge(row: StatementImportRowDto): SuggestionBadge | null {
  if (!isSuggested(row)) return null

  const source = row.suggestionSource
  if (isDetectionSource(source)) return { kind: 'detected', source }
  if (source === 'None') return null

  if (!row.included && row.categoryId === null && row.duplicateOfTransactionId === null) return { kind: 'ignoredBefore' }
  if (!row.suggestionConfidence) return null

  return { kind: 'learned', source, confidence: row.suggestionConfidence, uses: row.suggestionUses }
}

/** The plain "left out" badge, for rows no other badge already explains (duplicates, detections, ignored merchants). */
export function showsExcludedBadge(row: StatementImportRowDto) {
  if (row.included || row.duplicateOfTransactionId !== null) return false
  if (!isSuggested(row)) return true

  return !isDetectionSource(row.suggestionSource) && row.categoryId !== null
}
