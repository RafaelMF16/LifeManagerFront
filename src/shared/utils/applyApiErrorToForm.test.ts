import { describe, expect, it, vi } from 'vitest'
import { applyApiErrorToForm } from './applyApiErrorToForm'
import type { ApiErrorFieldMap } from './applyApiErrorToForm'

interface TestFormValues {
  email: string
  password: string
}

const fieldMap: ApiErrorFieldMap<TestFormValues> = {
  'User.EmailRegistered': { field: 'email', message: 'Este e-mail já está cadastrado' },
}

describe('applyApiErrorToForm', () => {
  it('seta o erro no campo mapeado com a mensagem em português', () => {
    const setError = vi.fn()

    applyApiErrorToForm(
      { code: 'User.EmailRegistered', message: 'Email already registered', type: 'Conflict' },
      setError,
      fieldMap,
    )

    expect(setError).toHaveBeenCalledWith('email', {
      type: 'server',
      message: 'Este e-mail já está cadastrado',
    })
  })

  it('cai no fallback root.serverError quando o código não está mapeado', () => {
    const setError = vi.fn()

    applyApiErrorToForm(
      { code: 'User.InvalidCredentials', message: 'Invalid email or password', type: 'Unauthorized' },
      setError,
      fieldMap,
    )

    expect(setError).toHaveBeenCalledWith('root.serverError', {
      type: 'server',
      message: 'Não foi possível concluir. Tente novamente.',
    })
  })

  it('usa a mensagem de fallback customizada quando informada', () => {
    const setError = vi.fn()

    applyApiErrorToForm(
      { code: 'User.InvalidCredentials', message: 'Invalid email or password', type: 'Unauthorized' },
      setError,
      fieldMap,
      'E-mail ou senha inválidos',
    )

    expect(setError).toHaveBeenCalledWith('root.serverError', {
      type: 'server',
      message: 'E-mail ou senha inválidos',
    })
  })
})
