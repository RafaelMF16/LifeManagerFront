import { describe, expect, it } from 'vitest'
import { greetingPeriod, localDateKey, todayLabel } from './greeting'

const at = (hours: number, minutes = 0) => new Date(2026, 10, 9, hours, minutes)

describe('greetingPeriod', () => {
  it.each([
    [at(5), 'morning'],
    [at(11, 59), 'morning'],
    [at(12), 'afternoon'],
    [at(17, 59), 'afternoon'],
    [at(18), 'evening'],
    [at(23, 59), 'evening'],
    [at(0), 'evening'],
    [at(4, 59), 'evening'],
  ] as const)('reads %s as %s', (date, period) => {
    expect(greetingPeriod(date)).toBe(period)
  })
})

describe('todayLabel', () => {
  it('writes the day in full, capitalized, without shifting it by the time zone', () => {
    expect(todayLabel('2026-11-09', 'pt-BR')).toBe('Segunda-feira, 9 de novembro')
    expect(todayLabel('2026-11-09', 'en-US')).toBe('Monday, November 9')
  })
})

describe('localDateKey', () => {
  it('pads the month and the day', () => {
    expect(localDateKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })
})
