import { z } from 'zod'
import { plainPasswordSchema, userNameSchema } from '../../shared/validation/userFields'

// O mesmo nome do cadastro (UserName.Create no backend, com o trim de User.Rename).
export const editNameSchema = z.object({ name: userNameSchema })

export type EditNameFormValues = z.infer<typeof editNameSchema>

// Trocar a senha: a atual só precisa estar preenchida (o backend confere, User.WrongPassword); a nova segue
// PlainPassword.Create, e a confirmação é regra só de UI.
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: 'account:security.password.currentRequired' }),
    newPassword: plainPasswordSchema,
    confirmPassword: z.string().min(1, { message: 'common:validation.confirmPassword.required' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'common:validation.confirmPassword.mismatch',
    path: ['confirmPassword'],
  })

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
