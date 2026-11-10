import { describe, expect, it } from 'vitest'
import { loginSchema, registerSchema } from './userSchemas'

const validRegisterPayload = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
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

  it('rejeita e-mail sem domínio (sem ponto depois do @)', () => {
    const result = registerSchema.safeParse({ ...validRegisterPayload, email: 'foo@bar' })
    expect(result.success).toBe(false)
  })

  it('rejeita e-mail com domínio terminando em ponto', () => {
    const result = registerSchema.safeParse({ ...validRegisterPayload, email: 'foo@bar.' })
    expect(result.success).toBe(false)
  })

  it('aceita e-mail com @ no meio', () => {
    const result = registerSchema.safeParse({ ...validRegisterPayload, email: 'foo@bar.com' })
    expect(result.success).toBe(true)
  })
})

describe('registerSchema - payload válido', () => {
  it('aceita payload válido', () => {
    const result = registerSchema.safeParse(validRegisterPayload)
    expect(result.success).toBe(true)
  })

  it('não tem campo de senha (a senha é escolhida pelo link do e-mail)', () => {
    const result = registerSchema.safeParse({ ...validRegisterPayload, password: 'x' })
    expect(result.success && 'password' in result.data).toBe(false)
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

  it('rejeita e-mail sem @ (evita request desnecessária ao backend)', () => {
    const result = loginSchema.safeParse({ email: 'semarroba', password: '12345678' })
    expect(result.success).toBe(false)
  })

  it('aceita payload válido', () => {
    const result = loginSchema.safeParse({ email: 'ada@example.com', password: '12345678' })
    expect(result.success).toBe(true)
  })
})
