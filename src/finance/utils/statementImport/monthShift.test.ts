import { describe, expect, it } from 'vitest'
import { nextMonthOf } from './monthShift'

describe('nextMonthOf', () => {
  it('gives the month after the date', () => {
    expect(nextMonthOf('2026-08-30')).toBe('2026-09')
    expect(nextMonthOf('2024-02-29')).toBe('2024-03')
  })

  it('crosses the year', () => {
    expect(nextMonthOf('2026-12-31')).toBe('2027-01')
  })
})
