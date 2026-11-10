import { describe, expect, it } from 'vitest'
import { editNameErrorFieldMap } from './accountErrorMap'

describe('editNameErrorFieldMap', () => {
  it('leva os erros do nome ao campo', () => {
    expect(editNameErrorFieldMap['User.UserNameIsNullOrWhiteSpace'].field).toBe('name')
    expect(editNameErrorFieldMap['User.UserNameTooLong'].message).toBe('common:validation.name.tooLong')
  })
})
