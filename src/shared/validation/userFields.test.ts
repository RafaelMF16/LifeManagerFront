import { describe, expect, it } from 'vitest'
import { newPasswordSchema, userNameSchema } from './userFields'

const validNewPasswordPayload = {
  password: '12345678',
  confirmPassword: '12345678',
}

describe('newPasswordSchema', () => {
  it('rejeita senha vazia', () => {
    const result = newPasswordSchema.safeParse({
      ...validNewPasswordPayload,
      password: '',
      confirmPassword: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita senha com menos de 8 caracteres', () => {
    const result = newPasswordSchema.safeParse({
      ...validNewPasswordPayload,
      password: '1234567',
      confirmPassword: '1234567',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita senha com mais de 50 caracteres', () => {
    const longPassword = '1'.repeat(51)
    const result = newPasswordSchema.safeParse({
      ...validNewPasswordPayload,
      password: longPassword,
      confirmPassword: longPassword,
    })
    expect(result.success).toBe(false)
  })

  it('aceita senha e confirmação iguais', () => {
    const result = newPasswordSchema.safeParse(validNewPasswordPayload)
    expect(result.success).toBe(true)
  })

  it('rejeita confirmação vazia', () => {
    const result = newPasswordSchema.safeParse({ ...validNewPasswordPayload, confirmPassword: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita quando confirmPassword diverge de password', () => {
    const result = newPasswordSchema.safeParse({
      ...validNewPasswordPayload,
      confirmPassword: '87654321',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const confirmError = result.error.issues.find((issue) => issue.path.includes('confirmPassword'))
      expect(confirmError?.message).toBe('common:validation.confirmPassword.mismatch')
    }
  })
})

describe('userNameSchema', () => {
  it('apara o nome, como o User.Rename do backend', () => {
    expect(userNameSchema.parse('  Rafa  ')).toBe('Rafa')
  })

  it('rejeita nome só com espaços', () => {
    const result = userNameSchema.safeParse('   ')
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0]?.message).toBe('common:validation.name.required')
  })

  it('rejeita nome com mais de 100 caracteres', () => {
    const result = userNameSchema.safeParse('a'.repeat(101))
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0]?.message).toBe('common:validation.name.tooLong')
  })
})
