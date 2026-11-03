import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const LEGACY_KEY = 'lm.accessToken'

function createStorage(): Storage {
  const items = new Map<string, string>()
  return {
    get length() {
      return items.size
    },
    clear: () => items.clear(),
    getItem: (key) => items.get(key) ?? null,
    key: (index) => [...items.keys()][index] ?? null,
    removeItem: (key) => void items.delete(key),
    setItem: (key, value) => void items.set(key, value),
  }
}

// Imported fresh in each test: the module holds the token and cleans the legacy key when it loads.
async function loadTokenStorage() {
  vi.resetModules()
  return import('./tokenStorage')
}

describe('tokenStorage', () => {
  beforeEach(() => {
    vi.stubGlobal('sessionStorage', createStorage())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('keeps the access token in memory, never in sessionStorage', async () => {
    const { getAccessToken, setAccessToken } = await loadTokenStorage()

    setAccessToken('token-1')

    expect(getAccessToken()).toBe('token-1')
    expect(sessionStorage.length).toBe(0)
  })

  it('forgets the token on clear', async () => {
    const { clearAccessToken, getAccessToken, setAccessToken } = await loadTokenStorage()

    setAccessToken('token-1')
    clearAccessToken()

    expect(getAccessToken()).toBeNull()
  })

  it('starts without a token and removes the one older versions left in sessionStorage', async () => {
    sessionStorage.setItem(LEGACY_KEY, 'old-token')

    const { getAccessToken } = await loadTokenStorage()

    expect(getAccessToken()).toBeNull()
    expect(sessionStorage.getItem(LEGACY_KEY)).toBeNull()
  })

  it('loads even when sessionStorage is unavailable', async () => {
    vi.stubGlobal('sessionStorage', {
      removeItem: () => {
        throw new Error('blocked')
      },
    })

    const { getAccessToken } = await loadTokenStorage()

    expect(getAccessToken()).toBeNull()
  })
})
