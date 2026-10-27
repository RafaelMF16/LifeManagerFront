import { describe, expect, it } from 'vitest'
import { calendarGrid, calendarKeyTarget } from './calendarGrid'

describe('calendarGrid', () => {
  it('starts on Sunday with no leading blanks when the 1st is a Sunday', () => {
    // February 2026 starts on a Sunday and has 28 days: exactly 4 full weeks.
    const weeks = calendarGrid('2026-02')

    expect(weeks).toHaveLength(4)
    expect(weeks[0][0]).toBe('2026-02-01')
    expect(weeks[3][6]).toBe('2026-02-28')
  })

  it('pads with blanks before the 1st and after the last day', () => {
    // August 2026 starts on a Saturday and has 31 days: 6 blanks, then 6 weeks.
    const weeks = calendarGrid('2026-08')

    expect(weeks).toHaveLength(6)
    expect(weeks[0]).toEqual([null, null, null, null, null, null, '2026-08-01'])
    expect(weeks[5]).toEqual(['2026-08-30', '2026-08-31', null, null, null, null, null])
  })

  it('always has 7 cells a week and every day once, in order', () => {
    const weeks = calendarGrid('2024-02')
    const days = weeks.flat().filter((day) => day !== null)

    expect(weeks.every((week) => week.length === 7)).toBe(true)
    expect(days).toHaveLength(29)
    expect(days[0]).toBe('2024-02-01')
    expect(days[28]).toBe('2024-02-29')
  })

  it('returns no weeks for an invalid month', () => {
    expect(calendarGrid('2026-13')).toEqual([])
  })
})

describe('calendarKeyTarget', () => {
  // October 2026 starts on a Thursday: its first week is [_, _, _, _, 1, 2, 3].
  const weeks = calendarGrid('2026-10')

  it('moves a day sideways and a week up or down', () => {
    expect(calendarKeyTarget(weeks, '2026-10-15', 'ArrowRight', '2026-10-31')).toBe('2026-10-16')
    expect(calendarKeyTarget(weeks, '2026-10-15', 'ArrowLeft', '2026-10-31')).toBe('2026-10-14')
    expect(calendarKeyTarget(weeks, '2026-10-15', 'ArrowDown', '2026-10-31')).toBe('2026-10-22')
    expect(calendarKeyTarget(weeks, '2026-10-15', 'ArrowUp', '2026-10-31')).toBe('2026-10-08')
  })

  it('goes to the start or end of the week, inside the month', () => {
    expect(calendarKeyTarget(weeks, '2026-10-02', 'Home', '2026-10-31')).toBe('2026-10-01')
    expect(calendarKeyTarget(weeks, '2026-10-02', 'End', '2026-10-31')).toBe('2026-10-03')
    expect(calendarKeyTarget(weeks, '2026-10-14', 'Home', '2026-10-31')).toBe('2026-10-11')
  })

  it('stays put past the month or past the last day that can be picked', () => {
    expect(calendarKeyTarget(weeks, '2026-10-01', 'ArrowLeft', '2026-10-31')).toBeNull()
    expect(calendarKeyTarget(weeks, '2026-10-03', 'ArrowUp', '2026-10-31')).toBeNull()
    expect(calendarKeyTarget(weeks, '2026-10-27', 'ArrowRight', '2026-10-27')).toBeNull()
    expect(calendarKeyTarget(weeks, '2026-10-24', 'ArrowDown', '2026-10-27')).toBeNull()
  })

  it('stops End at the last day that can be picked', () => {
    expect(calendarKeyTarget(weeks, '2026-10-25', 'End', '2026-10-27')).toBe('2026-10-27')
  })

  it('ignores other keys', () => {
    expect(calendarKeyTarget(weeks, '2026-10-15', 'Enter', '2026-10-31')).toBeNull()
  })
})
