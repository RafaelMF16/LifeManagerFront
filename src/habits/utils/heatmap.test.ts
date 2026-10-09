import { describe, expect, it } from 'vitest'
import type { HabitDayDto } from '../types/HabitStatsDtos'
import { heatmapWeeks, monthLabels, stateCounts, weekdayIndex } from './heatmap'

/** Consecutive days from `start` (`yyyy-MM-dd`), all in `state`. */
function daysFrom(start: string, count: number, state: HabitDayDto['state'] = 'None'): HabitDayDto[] {
  const [year, month, day] = start.split('-').map(Number)
  return Array.from({ length: count }, (_, offset) => ({
    date: new Date(Date.UTC(year, month - 1, day + offset)).toISOString().slice(0, 10),
    state,
  }))
}

describe('weekdayIndex', () => {
  it('counts from Monday', () => {
    expect(weekdayIndex('2026-10-05')).toBe(0)
    expect(weekdayIndex('2026-10-07')).toBe(2)
    expect(weekdayIndex('2026-10-11')).toBe(6)
  })
})

describe('heatmapWeeks', () => {
  it('pads the first week before the first day and the last week after today', () => {
    // Thursday 2026-07-09 to Wednesday 2026-10-07: 91 days.
    const weeks = heatmapWeeks(daysFrom('2026-07-09', 91))

    expect(weeks).toHaveLength(14)
    expect(weeks.every((week) => week.length === 7)).toBe(true)
    expect(weeks[0].slice(0, 3)).toEqual([null, null, null])
    expect(weeks[0][3]?.date).toBe('2026-07-09')
    expect(weeks[13][2]?.date).toBe('2026-10-07')
    expect(weeks[13].slice(3)).toEqual([null, null, null, null])
  })

  it('needs no padding when the days are whole weeks', () => {
    const weeks = heatmapWeeks(daysFrom('2026-10-05', 7))

    expect(weeks).toHaveLength(1)
    expect(weeks[0].every((day) => day !== null)).toBe(true)
  })

  it('is empty without days', () => {
    expect(heatmapWeeks([])).toEqual([])
  })
})

describe('monthLabels', () => {
  it('labels the first column and every column holding a 1st', () => {
    // Columns from 2026-09-07: October starts in the 4th one.
    const weeks = heatmapWeeks(daysFrom('2026-09-07', 31))

    expect(monthLabels(weeks, 'en-US')).toEqual(['Sep', '', '', 'Oct', ''])
  })

  it('leaves the first column out when the next month starts right after it', () => {
    const weeks = heatmapWeeks(daysFrom('2026-09-21', 17))

    expect(monthLabels(weeks, 'en-US')).toEqual(['', 'Oct', ''])
  })
})

describe('stateCounts', () => {
  it('counts the days by state', () => {
    const counts = stateCounts([...daysFrom('2026-10-01', 3, 'Done'), ...daysFrom('2026-10-04', 1, 'Missed')])

    expect(counts).toEqual({ Done: 3, Missed: 1 })
  })
})
