import { describe, expect, it } from 'vitest'
import { deletionDateLabel } from './deletionDate'

describe('deletionDateLabel', () => {
  // Midday UTC: the same day in any zone the tests may run in.
  const scheduledFor = '2026-11-17T12:00:00+00:00'

  it('mostra dia/mês em português e mês/dia em inglês', () => {
    expect(deletionDateLabel(scheduledFor, 'pt-BR')).toBe('17/11')
    expect(deletionDateLabel(scheduledFor, 'en-US')).toBe('11/17')
  })
})
