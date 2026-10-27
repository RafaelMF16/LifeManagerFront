import { describe, expect, it } from 'vitest'
import type { ApiError } from '../../shared/types/ApiError'
import { resolveAccountHolderError } from './accountHolderErrorMap'

function apiError(code: string, index?: number): ApiError {
  return { code, message: 'x', type: 'Validation', ...(index === undefined ? {} : { index }) }
}

describe('resolveAccountHolderError', () => {
  it.each([
    ['AccountHolder.NameIsNullOrWhiteSpace', 'required'],
    ['AccountHolder.NameTooLong', 'tooLong'],
    ['AccountHolder.NameTooShort', 'tooShort'],
    ['AccountHolder.DuplicateName', 'duplicate'],
  ])('puts %s under the name at its index', (code, key) => {
    expect(resolveAccountHolderError(apiError(code, 2))).toEqual({
      index: 2,
      message: `finance:accountHolders.validation.${key}`,
    })
  })

  it.each([
    ['AccountHolder.TooMany', 'finance:accountHolders.errors.tooMany'],
    ['AccountHolder.NamesRequired', 'common:errors.generic'],
    ['Something.Else', 'common:errors.generic'],
  ])('shows %s as a message for the whole list', (code, message) => {
    expect(resolveAccountHolderError(apiError(code))).toEqual({ index: null, message })
  })

  it('shows a name error for the whole list when the index is missing', () => {
    expect(resolveAccountHolderError(apiError('AccountHolder.NameTooShort'))).toEqual({
      index: null,
      message: 'finance:accountHolders.validation.tooShort',
    })
  })
})
