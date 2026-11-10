import { describe, expect, it } from 'vitest'
import { changePasswordSchema, editNameSchema } from './accountSchemas'

describe('editNameSchema', () => {
  it('apara o nome', () => {
    expect(editNameSchema.parse({ name: '  Rafa  ' })).toEqual({ name: 'Rafa' })
  })

  it('recusa um nome em branco e um com mais de 100 caracteres', () => {
    expect(editNameSchema.safeParse({ name: '   ' }).error?.issues[0].message).toBe('common:validation.name.required')
    expect(editNameSchema.safeParse({ name: 'a'.repeat(101) }).error?.issues[0].message).toBe('common:validation.name.tooLong')
  })
})

describe('changePasswordSchema', () => {
  const valid = { currentPassword: 'antiga123', newPassword: 'novasenha1', confirmPassword: 'novasenha1' }
  const messageOf = (values: typeof valid) => changePasswordSchema.safeParse(values).error?.issues[0]

  it('aceita a troca válida', () => {
    expect(changePasswordSchema.safeParse(valid).success).toBe(true)
  })

  it('exige a senha atual', () => {
    expect(messageOf({ ...valid, currentPassword: '' })).toMatchObject({
      path: ['currentPassword'],
      message: 'account:security.password.currentRequired',
    })
  })

  it('aplica as regras da senha nova', () => {
    expect(messageOf({ ...valid, newPassword: 'curta', confirmPassword: 'curta' })?.message).toBe('common:validation.password.tooShort')
    expect(messageOf({ ...valid, newPassword: 'a'.repeat(51), confirmPassword: 'a'.repeat(51) })?.message).toBe(
      'common:validation.password.tooLong',
    )
  })

  it('recusa a confirmação diferente, no campo da confirmação', () => {
    expect(messageOf({ ...valid, confirmPassword: 'outrasenha' })).toMatchObject({
      path: ['confirmPassword'],
      message: 'common:validation.confirmPassword.mismatch',
    })
  })
})
