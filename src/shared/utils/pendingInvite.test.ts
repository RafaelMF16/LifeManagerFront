import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearPendingInvite, PENDING_INVITE_MAX_AGE_MS, readPendingInvite, savePendingInvite } from './pendingInvite'

describe('pendingInvite', () => {
  let store: Map<string, string>

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-01T12:00:00Z'))
    store = new Map()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('gives back the saved code until it is cleared', () => {
    savePendingInvite('ABCD2345')

    expect(readPendingInvite()).toBe('ABCD2345')
    clearPendingInvite()
    expect(readPendingInvite()).toBeNull()
  })

  it('forgets a code older than a sign-up link', () => {
    savePendingInvite('ABCD2345')

    vi.advanceTimersByTime(PENDING_INVITE_MAX_AGE_MS)
    expect(readPendingInvite()).toBe('ABCD2345')
    vi.advanceTimersByTime(1)
    expect(readPendingInvite()).toBeNull()
  })

  it('ignores what an older version stored (a bare code) or anything unreadable', () => {
    store.set('lm-pending-invite', 'ABCD2345')
    expect(readPendingInvite()).toBeNull()

    store.set('lm-pending-invite', JSON.stringify({ code: '', savedAt: Date.now() }))
    expect(readPendingInvite()).toBeNull()
  })
})
