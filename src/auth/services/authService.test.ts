import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  completeRegistration,
  register,
  requestPasswordReset,
  resetPassword,
  verifyPasswordReset,
  verifyRegistration,
} from './authService'

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

describe('confirmation link', () => {
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    vi.stubGlobal('sessionStorage', createStorage())
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
  })

  it('verifies the token in the body, never in the URL', async () => {
    fetchMock.mockResolvedValue(Response.json({ email: 'ana@email.com', name: 'Ana' }))

    const pending = await verifyRegistration('tok_en')

    const [input, init] = fetchMock.mock.calls[0]
    expect(String(input)).toMatch(/\/api\/Auth\/Register\/Verify$/)
    expect(init?.method).toBe('POST')
    expect(JSON.parse(String(init?.body))).toEqual({ token: 'tok_en' })
    expect(pending).toEqual({ email: 'ana@email.com', name: 'Ana' })
  })

  it('completes the sign-up with the token and the password only', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 201 }))

    await completeRegistration('tok_en', { password: 'password123', confirmPassword: 'password123' })

    const [input, init] = fetchMock.mock.calls[0]
    expect(String(input)).toMatch(/\/api\/Auth\/Register\/Complete$/)
    expect(JSON.parse(String(init?.body))).toEqual({ token: 'tok_en', password: 'password123' })
  })
})

describe('password reset', () => {
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    vi.stubGlobal('sessionStorage', createStorage())
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
  })

  it('requests the reset link with the e-mail only', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 202 }))

    await requestPasswordReset({ email: 'ana@email.com' })

    const [input, init] = fetchMock.mock.calls[0]
    expect(String(input)).toMatch(/\/api\/Auth\/ForgotPassword$/)
    expect(init?.method).toBe('POST')
    expect(JSON.parse(String(init?.body))).toEqual({ email: 'ana@email.com' })
  })

  it('checks the reset link with the token in the body, never in the URL', async () => {
    fetchMock.mockResolvedValue(Response.json({ email: 'ana@email.com' }))

    const reset = await verifyPasswordReset('tok_en')

    const [input, init] = fetchMock.mock.calls[0]
    expect(String(input)).toMatch(/\/api\/Auth\/ResetPassword\/Verify$/)
    expect(JSON.parse(String(init?.body))).toEqual({ token: 'tok_en' })
    expect(reset).toEqual({ email: 'ana@email.com' })
  })

  it('resets the password with the token and the password only', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))
    sessionStorage.setItem('lm.accessToken', 'old-session')

    await resetPassword('tok_en', { password: 'password123', confirmPassword: 'password123' })

    const [input, init] = fetchMock.mock.calls[0]
    expect(String(input)).toMatch(/\/api\/Auth\/ResetPassword$/)
    expect(JSON.parse(String(init?.body))).toEqual({ token: 'tok_en', password: 'password123' })
    expect(sessionStorage.getItem('lm.accessToken')).toBeNull()
  })
})
