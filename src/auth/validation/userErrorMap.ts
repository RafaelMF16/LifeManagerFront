import type { ApiErrorFieldMap } from '../../shared/utils/applyApiErrorToForm'
import type { LoginFormValues, RegisterFormValues } from './userSchemas'

// Espelha os códigos de LifeManager.Domain/Users/Errors/UserErrors.cs
export const registerErrorFieldMap: ApiErrorFieldMap<RegisterFormValues> = {
  'User.UserNameIsNullOrWhiteSpace': { field: 'name', message: 'auth:validation.name.required' },
  'User.UserNameTooLong': { field: 'name', message: 'auth:validation.name.tooLong' },
  'User.EmailIsNullOrWhiteSpace': { field: 'email', message: 'auth:validation.email.required' },
  'User.EmailIsInvalid': { field: 'email', message: 'auth:validation.email.invalid' },
  'User.EmailRegistered': { field: 'email', message: 'auth:validation.email.taken' },
  'User.PlainPasswordIsNullOrWhiteSpace': { field: 'password', message: 'auth:validation.password.required' },
  'User.PlainPasswordTooShort': { field: 'password', message: 'auth:validation.password.tooShort' },
  'User.PlainPasswordTooLong': { field: 'password', message: 'auth:validation.password.tooLong' },
}

// 'User.InvalidCredentials' fica de fora de propósito: o backend não revela se foi
// o e-mail ou a senha (segurança), então cai no fallback root.serverError.
export const loginErrorFieldMap: ApiErrorFieldMap<LoginFormValues> = {}

export const loginFallbackMessage = 'common:errors.invalidCredentials'
