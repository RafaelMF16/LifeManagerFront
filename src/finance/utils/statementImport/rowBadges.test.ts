import { describe, expect, it } from 'vitest'
import type { StatementImportRowDto } from '../../types/StatementImportDtos'
import { showsExcludedBadge, suggestionBadge } from './rowBadges'

function row(overrides: Partial<StatementImportRowDto> = {}): StatementImportRowDto {
  return {
    id: 1,
    date: '2026-01-02',
    description: 'Aplicação RDB',
    originalDescription: 'Aplicação RDB',
    amount: 500,
    type: 'Expense',
    categoryId: null,
    categoryName: null,
    included: true,
    duplicateOfTransactionId: null,
    duplicateOfMonthlySummaryId: null,
    suggestionSource: 'None',
    suggestionConfidence: null,
    suggestionUses: 0,
    editedByUser: false,
    effectiveDate: '2026-01-02',
    shiftToNextMonth: false,
    shiftLearned: false,
    ...overrides,
  }
}

describe('suggestionBadge', () => {
  it('shows nothing when there was no suggestion or the user edited the row', () => {
    expect(suggestionBadge(row())).toBeNull()
    expect(suggestionBadge(row({ suggestionSource: 'Rule', suggestionConfidence: 'High', editedByUser: true }))).toBeNull()
    expect(suggestionBadge(row({ suggestionSource: 'OwnTransfer', suggestionConfidence: 'High', included: false, editedByUser: true }))).toBeNull()
  })

  it('names the detection, without confidence or uses, even when the row was left out', () => {
    expect(suggestionBadge(row({ type: 'Investment', suggestionSource: 'InvestmentApplication', suggestionConfidence: 'High' }))).toEqual({
      kind: 'detected',
      source: 'InvestmentApplication',
    })
    expect(suggestionBadge(row({ type: 'Income', included: false, suggestionSource: 'InvestmentRedemption', suggestionConfidence: 'High' }))).toEqual({
      kind: 'detected',
      source: 'InvestmentRedemption',
    })
    expect(suggestionBadge(row({ included: false, suggestionSource: 'OwnTransfer', suggestionConfidence: 'High' }))).toEqual({
      kind: 'detected',
      source: 'OwnTransfer',
    })
  })

  it('says the user left the merchant out before, for a learned rule to ignore', () => {
    expect(suggestionBadge(row({ included: false, suggestionSource: 'Rule', suggestionConfidence: 'High', suggestionUses: 3 }))).toEqual({
      kind: 'ignoredBefore',
    })
  })

  it('shows where a learned suggestion came from, its confidence and uses', () => {
    expect(suggestionBadge(row({ categoryId: 4, suggestionSource: 'History', suggestionConfidence: 'Medium', suggestionUses: 2 }))).toEqual({
      kind: 'learned',
      source: 'History',
      confidence: 'Medium',
      uses: 2,
    })
  })
})

describe('showsExcludedBadge', () => {
  it('marks a row the user left out', () => {
    expect(showsExcludedBadge(row({ included: false }))).toBe(true)
    expect(showsExcludedBadge(row({ included: false, suggestionSource: 'OwnTransfer', suggestionConfidence: 'High', editedByUser: true }))).toBe(true)
  })

  it('leaves the mark to the other badges for duplicates, detections and ignored merchants', () => {
    expect(showsExcludedBadge(row())).toBe(false)
    expect(showsExcludedBadge(row({ included: false, duplicateOfTransactionId: 9 }))).toBe(false)
    expect(showsExcludedBadge(row({ included: false, suggestionSource: 'InvestmentRedemption', suggestionConfidence: 'High' }))).toBe(false)
    expect(showsExcludedBadge(row({ included: false, suggestionSource: 'Rule', suggestionConfidence: 'High' }))).toBe(false)
  })
})
