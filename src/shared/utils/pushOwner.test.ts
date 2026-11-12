import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { accessTokenUserId, clearPushOwner, readPushOwner, savePushOwner } from './pushOwner'

function tokenWith(claims: object): string {
  const payload = btoa(JSON.stringify(claims)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `header.${payload}.signature`
}

describe('accessTokenUserId', () => {
  it('reads the nameid claim', () => {
    expect(accessTokenUserId(tokenWith({ nameid: '42', iss: 'LifeManager.Api' }))).toBe('42')
  })

  it('reads a payload whose base64url needs padding and url-safe characters', () => {
    expect(accessTokenUserId(tokenWith({ nameid: '7', x: '??>>' }))).toBe('7')
  })

  it.each([null, '', 'not-a-jwt', 'a.%%%.c', tokenWith({ sub: '1' })])('is null for %j', (token) => {
    expect(accessTokenUserId(token)).toBeNull()
  })
})

describe('push owner', () => {
  beforeEach(() => {
    const store = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
    })
  })

  afterEach(() => vi.unstubAllGlobals())

  it('reads nothing when storage is blocked', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked')
      },
    })

    expect(readPushOwner()).toBeNull()
  })

  it('keeps the account that turned the reminders on until cleared', () => {
    expect(readPushOwner()).toBeNull()

    savePushOwner('42')
    expect(readPushOwner()).toBe('42')

    clearPushOwner()
    expect(readPushOwner()).toBeNull()
  })
})
