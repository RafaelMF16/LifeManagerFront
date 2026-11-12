import { describe, expect, it } from 'vitest'
import { formatReminderHour, reminderHourOptions } from './reminderHour'

describe('formatReminderHour', () => {
  it('writes the hour in the language', () => {
    expect(formatReminderHour(20, 'pt-BR')).toBe('20:00')
    expect(formatReminderHour(6, 'pt-BR')).toBe('06:00')
    expect(formatReminderHour(20, 'en-US')).toMatch(/^8:00\sPM$/)
  })
})

describe('reminderHourOptions', () => {
  it('offers 06:00 to 23:00 as select values', () => {
    const options = reminderHourOptions('pt-BR')

    expect(options).toHaveLength(18)
    expect(options[0]).toEqual({ value: '6', label: '06:00' })
    expect(options.at(-1)).toEqual({ value: '23', label: '23:00' })
  })

  it('keeps an hour outside the list that the habit already has, in order', () => {
    const options = reminderHourOptions('pt-BR', 3)

    expect(options[0]).toEqual({ value: '3', label: '03:00' })
    expect(options).toHaveLength(19)
  })
})
