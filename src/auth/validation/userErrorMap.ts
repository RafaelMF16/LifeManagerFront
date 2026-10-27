import type { ApiErrorFieldMap } from '../../shared/utils/applyApiErrorToForm'
import type { ForgotPasswordFormValues, LoginFormValues, NewPasswordFormValues, RegisterFormValues } from './userSchemas'

// Espelha os códigos de LifeManager.Domain/Users/Errors/UserErrors.cs
export const registerErrorFieldMap: ApiErrorFieldMap<RegisterFormValues> = {
  'User.UserNameIsNullOrWhiteSpace': { field: 'name', message: 'auth:validation.name.required' },
  'User.UserNameTooLong': { field: 'name', message: 'auth:validation.name.tooLong' },
  'User.EmailIsNullOrWhiteSpace': { field: 'email', message: 'auth:validation.email.required' },
  'User.EmailIsInvalid': { field: 'email', message: 'auth:validation.email.invalid' },
}

export const forgotPasswordErrorFieldMap: ApiErrorFieldMap<ForgotPasswordFormValues> = {
  'User.EmailIsNullOrWhiteSpace': { field: 'email', message: 'auth:validation.email.required' },
  'User.EmailIsInvalid': { field: 'email', message: 'auth:validation.email.invalid' },
}

// Espelha LifeManager.Domain/Auth/Errors/AuthErrors.cs: link do e-mail desconhecido, expirado ou já usado.
// Não é erro de campo: a página troca o formulário pela mensagem de link inválido.
export const INVALID_EMAIL_TOKEN_CODE = 'Auth.InvalidEmailToken'

// 429 do limite por IP nos endpoints que enviam e-mail ou recebem o token do link (AuthRateLimits no backend)
export const TOO_MANY_REQUESTS_CODE = 'Auth.TooManyRequests'

// Senha escolhida pelo link (cadastro e recuperação): regras de PlainPassword.Create
export const newPasswordErrorFieldMap: ApiErrorFieldMap<NewPasswordFormValues> = {
  'User.PlainPasswordIsNullOrWhiteSpace': { field: 'password', message: 'auth:validation.password.required' },
  'User.PlainPasswordTooShort': { field: 'password', message: 'auth:validation.password.tooShort' },
  'User.PlainPasswordTooLong': { field: 'password', message: 'auth:validation.password.tooLong' },
}

// 'User.InvalidCredentials' fica de fora de propósito: o backend não revela se foi
// o e-mail ou a senha (segurança), então cai no fallback root.serverError.
export const loginErrorFieldMap: ApiErrorFieldMap<LoginFormValues> = {}

export const loginFallbackMessage = 'common:errors.invalidCredentials'
