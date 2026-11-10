import { describe, expect, it } from 'vitest'
import { quickTransactionToast } from './quickTransactionToast'

describe('quickTransactionToast', () => {
  it('names the month of the date in Portuguese', () => {
    expect(quickTransactionToast('2026-11-10', false, 'pt-BR')).toEqual({
      key: 'finance:transactions.quick.saved',
      period: 'novembro de 2026',
    })
  })

  it('names the month of the date in English', () => {
    expect(quickTransactionToast('2025-12-15', false, 'en-US').period).toBe('December 2025')
  })

  it('says the month was created when the entry opened it', () => {
    expect(quickTransactionToast('2026-01-31', true, 'pt-BR')).toEqual({
      key: 'finance:transactions.quick.savedMonthCreated',
      period: 'janeiro de 2026',
    })
  })
})
