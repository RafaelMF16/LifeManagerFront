import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { register } from './authService'

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

describe('register', () => {
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    vi.stubGlobal('sessionStorage', createStorage())
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue(new Response(null, { status: 202 }))
  })

  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
  })

  it('sends the sign-up screen language and theme as backend enum names', async () => {
    await register(
      { name: 'Ana', email: 'ana@email.com' },
      { theme: 'dark', language: 'en-US' },
    )

    const [input, init] = fetchMock.mock.calls[0]
    expect(String(input)).toMatch(/\/api\/Auth\/Register$/)
    expect(JSON.parse(String(init?.body))).toEqual({
      name: 'Ana',
      email: 'ana@email.com',
      theme: 'Dark',
      language: 'EN',
    })
  })
})
