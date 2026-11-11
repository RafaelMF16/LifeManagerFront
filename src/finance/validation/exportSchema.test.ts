import { describe, expect, it } from 'vitest'
import { EXPORT_MAX_MONTHS, exportMonthCount, exportSchema } from './exportSchema'

const valid = { from: '2026-01', to: '2026-11', type: 'All', format: 'PtBr' }

function messagesFor(values: Record<string, unknown>, field: string) {
  const result = exportSchema.safeParse(values)
  if (result.success) return []
  return result.error.issues.filter((issue) => issue.path[0] === field).map((issue) => issue.message)
}

describe('exportMonthCount', () => {
  it('counts both ends', () => {
    expect(exportMonthCount('2026-01', '2026-01')).toBe(1)
    expect(exportMonthCount('2025-12', '2026-01')).toBe(2)
    expect(exportMonthCount('2023-02', '2026-01')).toBe(36)
  })

  it('is 0 when the end comes first or a month is invalid', () => {
    expect(exportMonthCount('2026-02', '2026-01')).toBe(0)
    expect(exportMonthCount('', '2026-01')).toBe(0)
    expect(exportMonthCount('2026-13', '2026-01')).toBe(0)
  })
})

describe('exportSchema', () => {
  it('accepts a valid period of every type and format', () => {
    for (const type of ['All', 'Expense', 'Income', 'Investment']) {
      for (const format of ['PtBr', 'EnUs']) {
        expect(exportSchema.safeParse({ ...valid, type, format }).success).toBe(true)
      }
    }
  })

  it('accepts a single month', () => {
    expect(exportSchema.safeParse({ ...valid, from: '2026-05', to: '2026-05' }).success).toBe(true)
  })

  it(`accepts exactly ${EXPORT_MAX_MONTHS} months and rejects one more, on "to"`, () => {
    expect(exportSchema.safeParse({ ...valid, from: '2023-02', to: '2026-01' }).success).toBe(true)
    expect(messagesFor({ ...valid, from: '2023-01', to: '2026-01' }, 'to')).toEqual(['finance:export.validation.to.tooLong'])
  })

  it('rejects an end before the start, on "to"', () => {
    expect(messagesFor({ ...valid, from: '2026-03', to: '2026-02' }, 'to')).toEqual(['finance:export.validation.to.beforeFrom'])
  })

  it('rejects a missing or malformed month on its own field', () => {
    expect(messagesFor({ ...valid, from: '' }, 'from')).toEqual(['finance:export.validation.from.invalid'])
    expect(messagesFor({ ...valid, to: '2026-13' }, 'to')).toEqual(['finance:export.validation.to.invalid'])
  })

  it('rejects an unknown type or format', () => {
    expect(exportSchema.safeParse({ ...valid, type: 'Transfer' }).success).toBe(false)
    expect(exportSchema.safeParse({ ...valid, format: 'Csv' }).success).toBe(false)
  })
})
