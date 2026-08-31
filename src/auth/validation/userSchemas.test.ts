import { describe, expect, it } from 'vitest'
import { loginSchema, registerSchema } from './userSchemas'

const validRegisterPayload = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  password: '12345678',
  confirmPassword: '12345678',
}

describe('registerSchema - name', () => {
  it('rejeita nome vazio', () => {
    const result = registerSchema.safeParse({ ...validRegisterPayload, name: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita nome com mais de 100 caracteres', () => {
    const result = registerSchema.safeParse({ ...validRegisterPayload, name: 'a'.repeat(101) })
    expect(result.success).toBe(false)
  })
})

describe('registerSchema - email', () => {
  it('rejeita e-mail vazio', () => {
    const result = registerSchema.safeParse({ ...validRegisterPayload, email: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita e-mail sem @', () => {
    const result = registerSchema.safeParse({ ...validRegisterPayload, email: 'semarroba.com' })
    expect(result.success).toBe(false)
  })

  it('rejeita e-mail começando com @', () => {
    const result = registerSchema.safeParse({ ...validRegisterPayload, email: '@example.com' })
    expect(result.success).toBe(false)
  })

  it('rejeita e-mail terminando em @', () => {
    const result = registerSchema.safeParse({ ...validRegisterPayload, email: 'foo@' })
    expect(result.success).toBe(false)
  })

  it('aceita e-mail com @ no meio', () => {
    const result = registerSchema.safeParse({ ...validRegisterPayload, email: 'foo@bar.com' })
    expect(result.success).toBe(true)
  })
})

describe('registerSchema - password', () => {
  it('rejeita senha vazia', () => {
    const result = registerSchema.safeParse({
      ...validRegisterPayload,
      password: '',
      confirmPassword: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita senha com menos de 8 caracteres', () => {
    const result = registerSchema.safeParse({
      ...validRegisterPayload,
      password: '1234567',
      confirmPassword: '1234567',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita senha com mais de 50 caracteres', () => {
    const longPassword = '1'.repeat(51)
    const result = registerSchema.safeParse({
      ...validRegisterPayload,
      password: longPassword,
      confirmPassword: longPassword,
    })
    expect(result.success).toBe(false)
  })

  it('rejeita quando confirmPassword diverge de password', () => {
    const result = registerSchema.safeParse({
      ...validRegisterPayload,
      confirmPassword: '87654321',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const confirmError = result.error.issues.find((issue) => issue.path.includes('confirmPassword'))
      expect(confirmError?.message).toBe('As senhas não coincidem')
    }
  })
})

describe('registerSchema - payload válido', () => {
  it('aceita payload válido', () => {
    const result = registerSchema.safeParse(validRegisterPayload)
    expect(result.success).toBe(true)
  })
})

describe('loginSchema', () => {
  it('rejeita e-mail vazio', () => {
    const result = loginSchema.safeParse({ email: '', password: '12345678' })
    expect(result.success).toBe(false)
  })

  it('rejeita senha vazia', () => {
    const result = loginSchema.safeParse({ email: 'ada@example.com', password: '' })
    expect(result.success).toBe(false)
  })

  it('aceita e-mail sem @ (login não valida formato, só obrigatoriedade)', () => {
    const result = loginSchema.safeParse({ email: 'semarroba', password: '12345678' })
    expect(result.success).toBe(true)
  })

  it('aceita payload válido', () => {
    const result = loginSchema.safeParse({ email: 'ada@example.com', password: '12345678' })
    expect(result.success).toBe(true)
  })
})
