import { describe, expect, it } from 'vitest'
import { readEmailLinkToken, withoutEmailLinkToken } from './emailLinkToken'

describe('readEmailLinkToken', () => {
  it('reads the token from the query string', () => {
    expect(readEmailLinkToken('?token=abc_-123')).toBe('abc_-123')
  })

  it('decodes an escaped token', () => {
    expect(readEmailLinkToken('?token=a%2Bb%3D')).toBe('a+b=')
  })

  it('is null without a token or with an empty one', () => {
    expect(readEmailLinkToken('')).toBeNull()
    expect(readEmailLinkToken('?token=')).toBeNull()
    expect(readEmailLinkToken('?other=1')).toBeNull()
  })
})

describe('withoutEmailLinkToken', () => {
  it('drops the token and keeps the path, other parameters and hash', () => {
    expect(withoutEmailLinkToken('https://app.test/auth/set-password?token=abc&lang=en#top')).toBe('/auth/set-password?lang=en#top')
  })

  it('leaves no dangling "?" when the token was the only parameter', () => {
    expect(withoutEmailLinkToken('https://app.test/auth/reset-password?token=abc')).toBe('/auth/reset-password')
  })
})
