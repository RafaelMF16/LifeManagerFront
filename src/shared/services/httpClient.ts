import { isApiError } from '../types/ApiError'
import { refreshAccessToken } from './authSession'
import { getAccessToken } from './tokenStorage'

const BASE_URL = import.meta.env.VITE_API_BASE_URL
const CONNECTION_ERROR_MESSAGE = 'Não foi possível se comunicar com o servidor.'
const AUTH_PATH_PREFIX = '/api/Auth/'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface RequestOptions {
  method: HttpMethod
  body?: unknown
  signal?: AbortSignal
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

export class SessionExpiredError extends Error {
  constructor() {
    super('Session expired')
    this.name = 'SessionExpiredError'
  }
}

export function isSessionExpiredError(error: unknown): boolean {
  return error instanceof SessionExpiredError
}

async function parseBody<T>(response: Response): Promise<T | undefined> {
  const text = await response.text()
  return text ? (JSON.parse(text) as T) : undefined
}

async function send(path: string, options: RequestOptions): Promise<Response> {
  const accessToken = getAccessToken()

  try {
    return await fetch(`${BASE_URL}${path}`, {
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      credentials: 'include',
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    })
  } catch (error) {
    if (isAbortError(error)) throw error
    throw new Error(CONNECTION_ERROR_MESSAGE)
  }
}

async function tryRefreshAccessToken(): Promise<boolean> {
  try {
    return await refreshAccessToken()
  } catch {
    throw new Error(CONNECTION_ERROR_MESSAGE)
  }
}

export async function apiRequest<TResponse>(path: string, options: RequestOptions): Promise<TResponse> {
  let response = await send(path, options)

  if (response.status === 401 && !path.startsWith(AUTH_PATH_PREFIX)) {
    if (!(await tryRefreshAccessToken())) throw new SessionExpiredError()

    response = await send(path, options)
  }

  if (!response.ok) {
    const errorBody = await parseBody(response).catch(() => undefined)
    throw isApiError(errorBody) ? errorBody : new Error(`Erro inesperado do servidor (${response.status}).`)
  }

  return (await parseBody<TResponse>(response)) as TResponse
}
