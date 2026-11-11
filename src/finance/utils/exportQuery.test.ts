import { describe, expect, it } from 'vitest'
import { defaultExportPeriod, exportFallbackFileName, exportFormatFor, exportPath, parseRowCount } from './exportQuery'

describe('exportPath', () => {
  it('sends the period, the type and the format', () => {
    expect(exportPath({ from: '2026-01', to: '2026-11', type: 'Expense', format: 'EnUs' })).toBe(
      '/api/Transactions/Export?from=2026-01&to=2026-11&type=Expense&format=EnUs',
    )
  })
})

describe('defaultExportPeriod', () => {
  it('is the last 12 months through the current one', () => {
    expect(defaultExportPeriod(new Date(2026, 10, 11))).toEqual({ from: '2025-12', to: '2026-11' })
  })

  it('crosses the year in January', () => {
    expect(defaultExportPeriod(new Date(2026, 0, 31))).toEqual({ from: '2025-02', to: '2026-01' })
  })
})

describe('exportFormatFor', () => {
  it('picks the Brazilian spreadsheet in Portuguese and the English one otherwise', () => {
    expect(exportFormatFor('pt-BR')).toBe('PtBr')
    expect(exportFormatFor('en-US')).toBe('EnUs')
    expect(exportFormatFor('es')).toBe('EnUs')
  })
})

describe('exportFallbackFileName', () => {
  it('follows the backend pattern of each format', () => {
    expect(exportFallbackFileName({ from: '2026-01', to: '2026-11', format: 'PtBr' })).toBe('lancamentos-2026-01_2026-11.csv')
    expect(exportFallbackFileName({ from: '2026-01', to: '2026-11', format: 'EnUs' })).toBe('transactions-2026-01_2026-11.csv')
  })
})

describe('parseRowCount', () => {
  it('reads a whole number, zero included', () => {
    expect(parseRowCount('0')).toBe(0)
    expect(parseRowCount('42')).toBe(42)
  })

  it('is null when missing or unreadable', () => {
    expect(parseRowCount(null)).toBeNull()
    expect(parseRowCount('')).toBeNull()
    expect(parseRowCount('abc')).toBeNull()
    expect(parseRowCount('-1')).toBeNull()
    expect(parseRowCount('1.5')).toBeNull()
  })
})
