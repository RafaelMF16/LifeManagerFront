import { describe, expect, it } from 'vitest'
import { pastYearPresets, resolveDashboardPreset } from './dashboardPeriod'

// Local time, like the browser: the 5th of October 2026.
const today = new Date(2026, 9, 5)

describe('resolveDashboardPreset', () => {
  it.each([
    ['thisMonth', '2026-10', '2026-10'],
    ['last3Months', '2026-08', '2026-10'],
    ['last6Months', '2026-05', '2026-10'],
    ['last12Months', '2025-11', '2026-10'],
  ] as const)('%s ends with the current month', (preset, from, to) => {
    expect(resolveDashboardPreset(preset, today)).toEqual({ from, to, comparison: 'PreviousPeriod' })
  })

  it('crosses into the previous year at the start of a year', () => {
    expect(resolveDashboardPreset('last3Months', new Date(2026, 0, 31))).toEqual({
      from: '2025-11',
      to: '2026-01',
      comparison: 'PreviousPeriod',
    })
  })

  it('compares "this year" with the same months last year', () => {
    expect(resolveDashboardPreset('thisYear', today)).toEqual({
      from: '2026-01',
      to: '2026-10',
      comparison: 'SamePeriodLastYear',
    })
  })

  it('covers a whole past year', () => {
    expect(resolveDashboardPreset('year:2024', today)).toEqual({
      from: '2024-01',
      to: '2024-12',
      comparison: 'PreviousPeriod',
    })
  })
})

describe('pastYearPresets', () => {
  it('keeps only years before the current one', () => {
    expect(pastYearPresets([2026, 2025, 2023], today)).toEqual(['year:2025', 'year:2023'])
  })
})
