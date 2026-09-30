import { z } from 'zod'

// Espelha LifeManager.Domain/Categories/ValueObjects/CategoryName.cs (CategoryName.Create)
export const CATEGORY_NAME_MAX_LENGTH = 50

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'finance:categories.validation.name.required' }) // code: Category.NameIsNullOrWhiteSpace
    .max(CATEGORY_NAME_MAX_LENGTH, { message: 'finance:categories.validation.name.tooLong' }), // code: Category.NameTooLong
})

export type CategoryFormValues = z.infer<typeof categorySchema>
