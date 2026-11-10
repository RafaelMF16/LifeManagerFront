import { describe, expect, it } from 'vitest'
import { changePasswordErrorFieldMap, editNameErrorFieldMap } from './accountErrorMap'

describe('editNameErrorFieldMap', () => {
  it('leva os erros do nome ao campo', () => {
    expect(editNameErrorFieldMap['User.UserNameIsNullOrWhiteSpace'].field).toBe('name')
    expect(editNameErrorFieldMap['User.UserNameTooLong'].message).toBe('common:validation.name.tooLong')
  })
})

describe('changePasswordErrorFieldMap', () => {
  it('mostra a senha atual errada no campo da senha atual', () => {
    expect(changePasswordErrorFieldMap['User.WrongPassword']).toEqual({
      field: 'currentPassword',
      message: 'account:security.password.wrong',
    })
  })

  it('mostra as regras da senha no campo da senha nova', () => {
    expect(changePasswordErrorFieldMap['User.PlainPasswordTooShort'].field).toBe('newPassword')
  })
})
