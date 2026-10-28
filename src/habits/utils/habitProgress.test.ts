import { describe, expect, it } from 'vitest'
import type { HabitProgressEntryDto } from '../types/HabitTodayDtos'
import { formatAmount, progressPercent, remaining, withPendingProgress } from './habitProgress'

const entry = (id: number, value: number): HabitProgressEntryDto => ({ id, value, createdAt: '2026-10-28T09:00:00Z' })

describe('remaining', () => {
  it('is what is left to reach the target', () => {
    expect(remaining(1250, 2000)).toBe(750)
  })

  it('is never negative once past the target', () => {
    expect(remaining(2500, 2000)).toBe(0)
  })
})

describe('progressPercent', () => {
  it('is the share of the target, rounded down', () => {
    expect(progressPercent(1250, 2000)).toBe(62)
    expect(progressPercent(0, 2000)).toBe(0)
  })

  it('stops at 100 past the target', () => {
    expect(progressPercent(3000, 2000)).toBe(100)
  })
})

describe('formatAmount', () => {
  it('groups thousands as the language does', () => {
    expect(formatAmount(2000, 'pt-BR')).toBe('2.000')
    expect(formatAmount(2000, 'en-US')).toBe('2,000')
    expect(formatAmount(250, 'pt-BR')).toBe('250')
  })
})

describe('withPendingProgress', () => {
  const base = { progress: 1500, done: false, entries: [entry(1, 1000), entry(2, 500)] }

  it('keeps the saved state without pending changes', () => {
    expect(withPendingProgress(base, [], 2000)).toEqual(base)
  })

  it('adds pending amounts and completes the day once they reach the target', () => {
    const shown = withPendingProgress(base, [{ id: 1, kind: 'add', value: 250 }, { id: 2, kind: 'add', value: 250 }], 2000)
    expect(shown.progress).toBe(2000)
    expect(shown.done).toBe(true)
    expect(shown.entries).toEqual(base.entries)
  })

  it('hides a pending removal and undoes a done day that falls below the target', () => {
    const done = { progress: 2000, done: true, entries: [entry(1, 1500), entry(2, 500)] }
    const shown = withPendingProgress(done, [{ id: 3, kind: 'remove', entryId: 2, value: 500 }], 2000)
    expect(shown.progress).toBe(1500)
    expect(shown.done).toBe(false)
    expect(shown.entries).toEqual([entry(1, 1500)])
  })

  it('keeps a done day done while it stays at the target', () => {
    const done = { progress: 2500, done: true, entries: [entry(1, 2000), entry(2, 500)] }
    expect(withPendingProgress(done, [{ id: 4, kind: 'remove', entryId: 2, value: 500 }], 2000).done).toBe(true)
  })

  it('never completes a day by a removal, nor undoes it by an add', () => {
    // A day checked in below the target stays as the server has it.
    const doneBelow = { progress: 0, done: true, entries: [] }
    expect(withPendingProgress(doneBelow, [{ id: 5, kind: 'add', value: 100 }], 2000).done).toBe(true)
  })
})
