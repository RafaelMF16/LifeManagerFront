import { describe, expect, it } from 'vitest'
import { authErrorMessageKey, emailLinkFailure } from './authApiErrors'

const apiError = (code: string) => ({ code, message: 'm', type: 'Failure' as const })

describe('authErrorMessageKey', () => {
  it('uses the rate limit message for Auth.TooManyRequests', () => {
    expect(authErrorMessageKey(apiError('Auth.TooManyRequests'))).toBe('auth:errors.tooManyRequests')
  })

  it('falls back to the given key, or the generic one, for anything else', () => {
    expect(authErrorMessageKey(apiError('Server.UnexpectedError'))).toBe('common:errors.generic')
    expect(authErrorMessageKey(apiError('User.InvalidCredentials'), 'common:errors.invalidCredentials')).toBe(
      'common:errors.invalidCredentials',
    )
  })
})

describe('emailLinkFailure', () => {
  it('is invalid only for the invalid-token code', () => {
    expect(emailLinkFailure({ ...apiError('Auth.InvalidEmailToken'), type: 'Validation' })).toBe('invalid')
  })

  it('tells the rate limit apart', () => {
    expect(emailLinkFailure(apiError('Auth.TooManyRequests'))).toBe('tooManyRequests')
  })

  it('is an error for other API errors and for network failures', () => {
    expect(emailLinkFailure(apiError('Server.UnexpectedError'))).toBe('error')
    expect(emailLinkFailure(new TypeError('Failed to fetch'))).toBe('error')
  })
})
