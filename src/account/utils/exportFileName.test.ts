import { describe, expect, it } from 'vitest'
import { exportFallbackFileName } from './exportFileName'

describe('exportFallbackFileName', () => {
  it('usa a data local no padrão do backend', () => {
    expect(exportFallbackFileName(new Date(2026, 0, 5, 23, 30))).toBe('lifemanager-2026-01-05.json')
  })
})
