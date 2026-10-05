import { describe, expect, it } from 'vitest'
import { createFinanceFormat } from './useFinanceFormat'

describe('createFinanceFormat', () => {
  it('formats money normally when not hidden', () => {
    const format = createFinanceFormat('en-US', false)

    expect(format.money(-1234.5)).toBe('R$1,234.50')
    expect(format.signedMoney(-1)).toBe('−R$1.00')
    expect(format.percent(0.5)).toBe('50%')
  })

  it('masks every amount and percentage in privacy mode, keeping the currency symbol', () => {
    const format = createFinanceFormat('pt-BR', true)

    expect(format.money(-1234.5)).toBe('R$ ••••••')
    expect(format.signedMoney(-1)).toBe('R$ ••••••')
    expect(format.percent(0.623)).toBe('••%')
  })

  it('masks without digits or a sign, whatever the value', () => {
    const format = createFinanceFormat('en-US', true)

    for (const value of [0, 1, -1, 1234567.89]) {
      expect(format.money(value)).not.toMatch(/[\d−-]/)
      expect(format.signedMoney(value)).not.toMatch(/[\d−-]/)
    }
  })

  it('leaves dates and month names untouched in privacy mode', () => {
    const format = createFinanceFormat('en-US', true)

    expect(format.periodLabel(9, 2026)).toBe('September 2026')
    expect(format.dayLabel('2026-09-12')).toBe('Sep 12')
  })
})
