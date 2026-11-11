import type { ApiErrorFieldMap } from '../../shared/utils/applyApiErrorToForm'
import type { ChangePasswordFormValues, DeleteAccountFormValues, EditNameFormValues } from './accountSchemas'

// Espelha LifeManager.Domain/Users/Errors/UserErrors.cs (User.Rename)
export const editNameErrorFieldMap: ApiErrorFieldMap<EditNameFormValues> = {
  'User.UserNameIsNullOrWhiteSpace': { field: 'name', message: 'common:validation.name.required' },
  'User.UserNameTooLong': { field: 'name', message: 'common:validation.name.tooLong' },
}

// 429 dos limites por usuário (AccountRateLimits no backend): o mesmo código dos limites de Auth.
export const TOO_MANY_REQUESTS_CODE = 'Auth.TooManyRequests'

// Senha atual errada: um 400 de propósito (um 401 fora de /api/Auth seria lido como sessão expirada).
export const WRONG_PASSWORD_CODE = 'User.WrongPassword'

// POST /api/Auth/ChangePassword: a senha atual, depois as regras de PlainPassword.Create na nova.
export const changePasswordErrorFieldMap: ApiErrorFieldMap<ChangePasswordFormValues> = {
  [WRONG_PASSWORD_CODE]: { field: 'currentPassword', message: 'account:security.password.wrong' },
  'User.PlainPasswordIsNullOrWhiteSpace': { field: 'newPassword', message: 'common:validation.password.required' },
  'User.PlainPasswordTooShort': { field: 'newPassword', message: 'common:validation.password.tooShort' },
  'User.PlainPasswordTooLong': { field: 'newPassword', message: 'common:validation.password.tooLong' },
}

// POST /api/Users/Me/Deletion: só a senha é conferida no backend.
export const deleteAccountErrorFieldMap: ApiErrorFieldMap<DeleteAccountFormValues> = {
  [WRONG_PASSWORD_CODE]: { field: 'password', message: 'account:security.password.wrong' },
}
