import { describe, expect, it } from 'vitest'
import { addMonths, formatYearMonth, neighborMonths, parseYearMonth, toIsoDate, toYearMonth } from './yearMonth'

describe('yearMonth', () => {
  it('formats with a zero-padded month', () => {
    expect(formatYearMonth(2026, 3)).toBe('2026-03')
    expect(toYearMonth(new Date(2026, 9, 6))).toBe('2026-10')
  })

  it('formats a local date as YYYY-MM-DD', () => {
    expect(toIsoDate(new Date(2026, 9, 6))).toBe('2026-10-06')
    expect(toIsoDate(new Date(2026, 0, 31, 23, 59))).toBe('2026-01-31')
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

describe('neighborMonths', () => {
  const period = ['2026-08', '2026-09', '2026-10']

  it('steps to the months on each side inside the period', () => {
    expect(neighborMonths(period, '2026-09')).toEqual({ previous: '2026-08', next: '2026-10' })
  })

  it('stops at the first and the last month of the period', () => {
    expect(neighborMonths(period, '2026-08')).toEqual({ previous: null, next: '2026-09' })
    expect(neighborMonths(period, '2026-10')).toEqual({ previous: '2026-09', next: null })
  })

  it('has nowhere to go in a one-month period or outside the period', () => {
    expect(neighborMonths(['2026-10'], '2026-10')).toEqual({ previous: null, next: null })
    expect(neighborMonths(period, '2026-12')).toEqual({ previous: null, next: null })
  })
})
