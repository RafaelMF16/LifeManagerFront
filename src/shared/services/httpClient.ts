import { isApiError } from '../types/ApiError'
import { refreshAccessToken } from './authSession'
import { getAccessToken } from './tokenStorage'

const BASE_URL = import.meta.env.VITE_API_BASE_URL
const CONNECTION_ERROR_MESSAGE = 'Não foi possível se comunicar com o servidor.'
const AUTH_PATH_PREFIX = '/api/Auth/'
// The /api/Auth endpoints that need the access token (My account; there because only /api/Auth gets the refresh
// cookie): a 401 there is an expired access token, renewed like anywhere else. Any other 401 under /api/Auth is the
// answer itself (wrong credentials, a dead refresh token).
const AUTHENTICATED_AUTH_PATHS = new Set(['/api/Auth/ChangePassword', '/api/Auth/LogoutAll'])

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

function canRenewOn401(path: string): boolean {
  return !path.startsWith(AUTH_PATH_PREFIX) || AUTHENTICATED_AUTH_PATHS.has(path)
}

/** Sends the request, renewing the access token once on a 401 outside /api/Auth, and throws on an error status. */
async function sendChecked(path: string, options: RequestOptions): Promise<Response> {
  let response = await send(path, options)

  if (response.status === 401 && canRenewOn401(path)) {
    if (!(await tryRefreshAccessToken())) throw new SessionExpiredError()

    response = await send(path, options)
  }

  if (!response.ok) {
    const errorBody = await parseBody(response).catch(() => undefined)
    throw isApiError(errorBody) ? errorBody : new Error(`Erro inesperado do servidor (${response.status}).`)
  }

  return response
}

export async function apiRequest<TResponse>(path: string, options: RequestOptions): Promise<TResponse> {
  const response = await sendChecked(path, options)

  return (await parseBody<TResponse>(response)) as TResponse
}

/** A file the backend sends as an attachment (e.g. the data export): its bytes and the `Content-Disposition` header. */
export async function apiDownload(path: string, signal?: AbortSignal): Promise<{ blob: Blob; contentDisposition: string | null }> {
  const response = await sendChecked(path, { method: 'GET', signal })

  return { blob: await response.blob(), contentDisposition: response.headers.get('Content-Disposition') }
}
