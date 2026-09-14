import { isApiError } from '../types/ApiError'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface RequestOptions {
  method: HttpMethod
  body?: unknown
}

async function parseBody<T>(response: Response): Promise<T | undefined> {
  const text = await response.text()
  return text ? (JSON.parse(text) as T) : undefined
}

export async function apiRequest<TResponse>(path: string, options: RequestOptions): Promise<TResponse> {
  let response: Response

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: options.method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    })
  } catch {
    throw new Error('Não foi possível se comunicar com o servidor.')
  }

  if (!response.ok) {
    const errorBody = await parseBody(response).catch(() => undefined)
    throw isApiError(errorBody) ? errorBody : new Error(`Erro inesperado do servidor (${response.status}).`)
  }

  return (await parseBody<TResponse>(response)) as TResponse
}
