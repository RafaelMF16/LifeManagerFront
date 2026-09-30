import { isApiError } from '../types/ApiError'
import { getAccessToken } from './tokenStorage'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface RequestOptions {
  method: HttpMethod
  body?: unknown
  /**
   * Aborting it closes the connection, which fires the backend's `CancellationToken`
   * (`HttpContext.RequestAborted`). Meant for reads only: a cancelled mutation may already
   * have been persisted server-side, leaving the UI out of sync.
   */
  signal?: AbortSignal
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

async function parseBody<T>(response: Response): Promise<T | undefined> {
  const text = await response.text()
  return text ? (JSON.parse(text) as T) : undefined
}

export async function apiRequest<TResponse>(path: string, options: RequestOptions): Promise<TResponse> {
  let response: Response
  const accessToken = getAccessToken()

  try {
    response = await fetch(`${BASE_URL}${path}`, {
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
    throw new Error('Não foi possível se comunicar com o servidor.')
  }

  if (!response.ok) {
    const errorBody = await parseBody(response).catch(() => undefined)
    throw isApiError(errorBody) ? errorBody : new Error(`Erro inesperado do servidor (${response.status}).`)
  }

  return (await parseBody<TResponse>(response)) as TResponse
}
