import type { ApiErrorFieldMap } from '../../shared/utils/applyApiErrorToForm'
import type { CategoryFormValues } from './categorySchema'

// Espelha os códigos de LifeManager.Domain/Categories/Errors/CategoryErrors.cs
export const CATEGORY_NOT_FOUND_CODE = 'Category.NotFound'
export const CATEGORY_IN_USE_CODE = 'Category.InUse'

export const categoryErrorFieldMap: ApiErrorFieldMap<CategoryFormValues> = {
  'Category.NameIsNullOrWhiteSpace': { field: 'name', message: 'finance:categories.validation.name.required' },
  'Category.NameTooLong': { field: 'name', message: 'finance:categories.validation.name.tooLong' },
  'Category.NameAlreadyExists': { field: 'name', message: 'finance:categories.validation.name.taken' },
}
