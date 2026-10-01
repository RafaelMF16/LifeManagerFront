import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest, isSessionExpiredError } from './httpClient'
import { onSessionExpired } from './sessionEvents'
import { getAccessToken, setAccessToken } from './tokenStorage'

function jsonResponse(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), { status })
}

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

const isRefreshCall = (input: RequestInfo | URL) => String(input).endsWith('/api/Auth/Refresh')
const authHeaderOf = (init?: RequestInit) => (init?.headers as Record<string, string> | undefined)?.Authorization

describe('apiRequest (renovação do access token)', () => {
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    vi.stubGlobal('sessionStorage', createStorage())
    vi.stubGlobal('fetch', fetchMock)
    setAccessToken('expired-token')
  })

  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
  })

  it('renova o token num 401 e repete a requisição com o token novo', async () => {
    fetchMock.mockImplementation(async (input, init) => {
      if (isRefreshCall(input)) return jsonResponse(200, { accessToken: 'new-token' })
      return authHeaderOf(init) === 'Bearer new-token' ? jsonResponse(200, { ok: true }) : jsonResponse(401)
    })

    const result = await apiRequest<{ ok: boolean }>('/api/Categories', { method: 'GET' })

    expect(result).toEqual({ ok: true })
    expect(getAccessToken()).toBe('new-token')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('faz um único refresh quando várias requisições recebem 401 ao mesmo tempo', async () => {
    fetchMock.mockImplementation(async (input, init) => {
      if (isRefreshCall(input)) return jsonResponse(200, { accessToken: 'new-token' })
      return authHeaderOf(init) === 'Bearer new-token' ? jsonResponse(200, {}) : jsonResponse(401)
    })

    await Promise.all([
      apiRequest('/api/Categories', { method: 'GET' }),
      apiRequest('/api/UserPreferences', { method: 'GET' }),
      apiRequest('/api/Categories/1', { method: 'GET' }),
    ])

    expect(fetchMock.mock.calls.filter(([input]) => isRefreshCall(input))).toHaveLength(1)
  })

  it('emite sessão expirada uma vez e lança SessionExpiredError quando o refresh é recusado', async () => {
    fetchMock.mockImplementation(async () => jsonResponse(401))
    const listener = vi.fn()
    const unsubscribe = onSessionExpired(listener)

    const results = await Promise.allSettled([
      apiRequest('/api/Categories', { method: 'GET' }),
      apiRequest('/api/UserPreferences', { method: 'GET' }),
    ])
    unsubscribe()

    expect(results.every((r) => r.status === 'rejected' && isSessionExpiredError(r.reason))).toBe(true)
    expect(listener).toHaveBeenCalledTimes(1)
    expect(getAccessToken()).toBeNull()
    // 2 requisições + 1 refresh, sem retry em loop.
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('não tenta refresh num 401 de endpoint de Auth (credenciais inválidas no Login)', async () => {
    const apiError = { code: 'User.InvalidCredentials', message: 'Invalid email or password', type: 'Unauthorized' }
    fetchMock.mockImplementation(async () => jsonResponse(401, apiError))

    await expect(apiRequest('/api/Auth/Login', { method: 'POST', body: {} })).rejects.toEqual(apiError)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('não desloga quando o refresh falha por erro de rede', async () => {
    fetchMock.mockImplementation(async (input) => {
      if (isRefreshCall(input)) throw new TypeError('Failed to fetch')
      return jsonResponse(401)
    })
    const listener = vi.fn()
    const unsubscribe = onSessionExpired(listener)

    await expect(apiRequest('/api/Categories', { method: 'GET' })).rejects.toThrow('Não foi possível se comunicar com o servidor.')
    unsubscribe()

    expect(listener).not.toHaveBeenCalled()
    expect(getAccessToken()).toBe('expired-token')
  })
})
