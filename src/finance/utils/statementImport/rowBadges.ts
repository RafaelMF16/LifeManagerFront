import type { StatementImportRowDto, SuggestionConfidence, SuggestionSource } from '../../types/StatementImportDtos'

/** Filed by what the bank wrote (an investment movement, a transfer between the user's own accounts), not by history. */
const DETECTION_SOURCES = ['InvestmentApplication', 'InvestmentRedemption', 'OwnTransfer'] as const satisfies readonly SuggestionSource[]

export type DetectionSource = (typeof DETECTION_SOURCES)[number]
type LearnedSource = Extract<SuggestionSource, 'Rule' | 'History' | 'Similar'>

function isDetectionSource(source: SuggestionSource): source is DetectionSource {
  return (DETECTION_SOURCES as readonly SuggestionSource[]).includes(source)
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

/** The month a row counts in when it was moved to the month after its date, and whether history moved it. */
export function monthShiftBadge(row: StatementImportRowDto): { month: string; learned: boolean } | null {
  if (!row.shiftToNextMonth) return null

  return { month: row.effectiveDate.slice(0, 7), learned: row.shiftLearned }
}
