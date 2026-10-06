import { describe, expect, it } from 'vitest'
import { addMonths, formatYearMonth, parseYearMonth, toYearMonth } from './yearMonth'

describe('yearMonth', () => {
  it('formats with a zero-padded month', () => {
    expect(formatYearMonth(2026, 3)).toBe('2026-03')
    expect(toYearMonth(new Date(2026, 9, 6))).toBe('2026-10')
  })

  it('parses valid months only', () => {
    expect(parseYearMonth('2026-09')).toEqual({ year: 2026, month: 9 })
    expect(parseYearMonth('2026-13')).toBeNull()
    expect(parseYearMonth('2026-9')).toBeNull()
    expect(parseYearMonth('')).toBeNull()
    expect(parseYearMonth(null)).toBeNull()
  })

  it('adds months across years', () => {
    expect(addMonths('2026-12', 1)).toBe('2027-01')
    expect(addMonths('2026-01', -1)).toBe('2025-12')
    expect(addMonths('2026-10', 15)).toBe('2028-01')
  })

  it('sorts chronologically as plain strings', () => {
    expect(['2027-01', '2026-10', '2026-09', '2026-12'].sort()).toEqual(['2026-09', '2026-10', '2026-12', '2027-01'])
  })
})
