import { isApiError } from '../../shared/types/ApiError'
import { INVALID_EMAIL_TOKEN_CODE, TOO_MANY_REQUESTS_CODE } from '../validation/userErrorMap'

const GENERIC_MESSAGE_KEY = 'common:errors.generic'
const TOO_MANY_REQUESTS_MESSAGE_KEY = 'auth:errors.tooManyRequests'

/** Form-level message for an auth error no field claims: the rate limit gets its own, anything else the generic one. */
export function authErrorMessageKey(error: unknown, fallbackKey: string = GENERIC_MESSAGE_KEY): string {
  return isApiError(error) && error.code === TOO_MANY_REQUESTS_CODE ? TOO_MANY_REQUESTS_MESSAGE_KEY : fallbackKey
}

/**
 * Why checking an e-mail link failed. Only the backend's invalid-token code means a bad link: a rate limit or any
 * other error leaves the link possibly fine, so the page offers to try again.
 */
export function emailLinkFailure(error: unknown): 'invalid' | 'tooManyRequests' | 'error' {
  if (!isApiError(error)) return 'error'
  if (error.code === TOO_MANY_REQUESTS_CODE) return 'tooManyRequests'
  return error.code === INVALID_EMAIL_TOKEN_CODE ? 'invalid' : 'error'
}
