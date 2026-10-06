import { describe, expect, it } from 'vitest'
import { budgetStatus, closedMonthsScore, isMonthOpen } from './budgetStatus'

describe('budgetStatus', () => {
  it.each([
    [0, 'onTrack'],
    [0.79, 'onTrack'],
    [0.8, 'nearLimit'],
    [1, 'nearLimit'],
    [1.01, 'overLimit'],
  ] as const)('reads an expense ratio of %d as %s', (ratio, expected) => {
    expect(budgetStatus('Expense', ratio)).toBe(expected)
  })

  it.each([
    [0.5, 'belowTarget'],
    [0.999, 'belowTarget'],
    [1, 'reached'],
    [1.4, 'reached'],
  ] as const)('reads an investment ratio of %d as %s', (ratio, expected) => {
    expect(budgetStatus('Investment', ratio)).toBe(expected)
  })
})

describe('isMonthOpen', () => {
  const today = new Date(2026, 9, 6)

  it('treats the current and later months as open', () => {
    expect(isMonthOpen(2026, 10, today)).toBe(true)
    expect(isMonthOpen(2027, 1, today)).toBe(true)
    expect(isMonthOpen(2026, 9, today)).toBe(false)
    expect(isMonthOpen(2025, 12, today)).toBe(false)
  })
})

describe('closedMonthsScore', () => {
  it('counts only closed months that had the goal', () => {
    const score = closedMonthsScore(
      [
        { year: 2026, month: 7, achieved: true },
        { year: 2026, month: 8, achieved: false },
        { year: 2026, month: 9, achieved: null },
        { year: 2026, month: 10, achieved: true },
      ],
      new Date(2026, 9, 6),
    )

    expect(score).toEqual({ achieved: 1, total: 2 })
  })
})
