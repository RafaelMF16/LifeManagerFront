import { describe, expect, it } from 'vitest'
import { editNameSchema } from './accountSchemas'

describe('editNameSchema', () => {
  it('apara o nome', () => {
    expect(editNameSchema.parse({ name: '  Rafa  ' })).toEqual({ name: 'Rafa' })
  })

  it('recusa um nome em branco e um com mais de 100 caracteres', () => {
    expect(editNameSchema.safeParse({ name: '   ' }).error?.issues[0].message).toBe('common:validation.name.required')
    expect(editNameSchema.safeParse({ name: 'a'.repeat(101) }).error?.issues[0].message).toBe('common:validation.name.tooLong')
  })
})
