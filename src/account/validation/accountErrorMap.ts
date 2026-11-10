import type { ApiErrorFieldMap } from '../../shared/utils/applyApiErrorToForm'
import type { EditNameFormValues } from './accountSchemas'

// Espelha LifeManager.Domain/Users/Errors/UserErrors.cs (User.Rename)
export const editNameErrorFieldMap: ApiErrorFieldMap<EditNameFormValues> = {
  'User.UserNameIsNullOrWhiteSpace': { field: 'name', message: 'common:validation.name.required' },
  'User.UserNameTooLong': { field: 'name', message: 'common:validation.name.tooLong' },
}
