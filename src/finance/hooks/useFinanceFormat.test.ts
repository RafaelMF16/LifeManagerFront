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

  it('formats the dashboard figures when not hidden', () => {
    const format = createFinanceFormat('en-US', false)

    expect(format.compactMoney(-1234)).toBe('R$1.2K')
    expect(format.signedCompactMoney(-1234)).toBe('−R$1.2K')
    expect(format.signedPercent(0.12)).toBe('+12%')
    expect(format.signedPercent(-0.05)).toBe('−5%')
    expect(format.signedPercent(0)).toBe('0%')
    expect(format.signedPercent(49)).toBe('>+999%')
  })

  it('masks the dashboard figures in privacy mode', () => {
    const format = createFinanceFormat('pt-BR', true)

    expect(format.compactMoney(1234)).toBe('R$ ••••••')
    expect(format.signedCompactMoney(-1234)).toBe('R$ ••••••')
    expect(format.signedPercent(-0.05)).toBe('••%')
  })

  it('labels month ranges without masking them', () => {
    const format = createFinanceFormat('pt-BR', true)

    expect(format.shortMonthName(9)).toBe('Set')
    expect(format.rangeLabel('2026-09', '2026-09')).toBe('Set 2026')
    expect(format.rangeLabel('2026-04', '2026-09')).toBe('Abr – Set 2026')
    expect(format.rangeLabel('2025-11', '2026-01')).toBe('Nov 2025 – Jan 2026')
  })

  it('leaves dates and month names untouched in privacy mode', () => {
    const format = createFinanceFormat('en-US', true)

    expect(format.periodLabel(9, 2026)).toBe('September 2026')
    expect(format.dayLabel('2026-09-12')).toBe('Sep 12')
  })
})
