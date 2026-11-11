import { describe, expect, it } from 'vitest'
import { shouldCheckForUpdate, UPDATE_CHECK_MIN_GAP_MS } from './swUpdateCheck'

describe('shouldCheckForUpdate', () => {
  const now = 1_000_000_000

  it('checa na primeira vez e depois do intervalo mínimo', () => {
    expect(shouldCheckForUpdate({ lastCheckAt: null, now, online: true })).toBe(true)
    expect(shouldCheckForUpdate({ lastCheckAt: now - UPDATE_CHECK_MIN_GAP_MS, now, online: true })).toBe(true)
  })

  it('não checa de novo logo em seguida (trocar de aba várias vezes)', () => {
    expect(shouldCheckForUpdate({ lastCheckAt: now - UPDATE_CHECK_MIN_GAP_MS + 1, now, online: true })).toBe(false)
  })

  it('não checa sem rede', () => {
    expect(shouldCheckForUpdate({ lastCheckAt: null, now, online: false })).toBe(false)
  })
})
