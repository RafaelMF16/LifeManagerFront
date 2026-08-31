import type { ApiErrorFieldMap } from '../../shared/utils/applyApiErrorToForm'
import type { LoginFormValues, RegisterFormValues } from './userSchemas'

// Espelha os códigos de LifeManager.Domain/Users/Errors/UserErrors.cs
export const registerErrorFieldMap: ApiErrorFieldMap<RegisterFormValues> = {
  'User.UserNameIsNullOrWhiteSpace': { field: 'name', message: 'Nome é obrigatório' },
  'User.UserNameTooLong': { field: 'name', message: 'Nome não pode ter mais de 100 caracteres' },
  'User.EmailIsNullOrWhiteSpace': { field: 'email', message: 'E-mail é obrigatório' },
  'User.EmailIsInvalid': { field: 'email', message: 'E-mail inválido' },
  'User.EmailRegistered': { field: 'email', message: 'Este e-mail já está cadastrado' },
  'User.PlainPasswordIsNullOrWhiteSpace': { field: 'password', message: 'Senha é obrigatória' },
  'User.PlainPasswordTooShort': { field: 'password', message: 'Senha deve ter no mínimo 8 caracteres' },
  'User.PlainPasswordTooLong': { field: 'password', message: 'Senha não pode ter mais de 50 caracteres' },
}

// 'User.InvalidCredentials' fica de fora de propósito: o backend não revela se foi
// o e-mail ou a senha (segurança), então cai no fallback root.serverError.
export const loginErrorFieldMap: ApiErrorFieldMap<LoginFormValues> = {}

export const loginFallbackMessage = 'E-mail ou senha inválidos'
