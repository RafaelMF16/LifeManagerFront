import { describe, expect, it, vi } from 'vitest'
import { applyApiErrorToForm } from './applyApiErrorToForm'
import type { ApiErrorFieldMap } from './applyApiErrorToForm'

interface TestFormValues {
  email: string
  password: string
}

const fieldMap: ApiErrorFieldMap<TestFormValues> = {
  'User.EmailRegistered': { field: 'email', message: 'test:email.taken' },
}

const translate = (key: string) => `translated:${key}`

describe('applyApiErrorToForm', () => {
  it('seta o erro no campo mapeado com a mensagem traduzida', () => {
    const setError = vi.fn()

    applyApiErrorToForm(
      { code: 'User.EmailRegistered', message: 'Email already registered', type: 'Conflict' },
      setError,
      fieldMap,
      translate,
    )

    expect(setError).toHaveBeenCalledWith('email', {
      type: 'server',
      message: 'translated:test:email.taken',
    })
  })

  it('cai no fallback root.serverError quando o código não está mapeado', () => {
    const setError = vi.fn()

    applyApiErrorToForm(
      { code: 'User.InvalidCredentials', message: 'Invalid email or password', type: 'Unauthorized' },
      setError,
      fieldMap,
      translate,
    )

    expect(setError).toHaveBeenCalledWith('root.serverError', {
      type: 'server',
      message: 'translated:common:errors.generic',
    })
  })

  it('usa a chave de fallback customizada quando informada', () => {
    const setError = vi.fn()

    applyApiErrorToForm(
      { code: 'User.InvalidCredentials', message: 'Invalid email or password', type: 'Unauthorized' },
      setError,
      fieldMap,
      translate,
      'common:errors.invalidCredentials',
    )

    expect(setError).toHaveBeenCalledWith('root.serverError', {
      type: 'server',
      message: 'translated:common:errors.invalidCredentials',
    })
  })
})
