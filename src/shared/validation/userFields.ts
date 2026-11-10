import { z } from 'zod'

// Nome e senha valem em mais de um módulo (cadastro e recuperação em auth/, Minha conta em account/), por isso ficam
// em shared/ e as mensagens no namespace common.

// Espelha LifeManager.Domain/Users/ValueObjects/UserName.cs (UserName.Create, com o trim de User.Rename)
export const userNameSchema = z
  .string()
  .trim()
  .min(1, { message: 'common:validation.name.required' }) // code: User.UserNameIsNullOrWhiteSpace
  .max(100, { message: 'common:validation.name.tooLong' }) // code: User.UserNameTooLong

// Espelha LifeManager.Domain/Users/ValueObjects/PlainPassword.cs (PlainPassword.Create)
export const plainPasswordSchema = z
  .string()
  .min(1, { message: 'common:validation.password.required' }) // code: User.PlainPasswordIsNullOrWhiteSpace
  .min(8, { message: 'common:validation.password.tooShort' }) // code: User.PlainPasswordTooShort
  .max(50, { message: 'common:validation.password.tooLong' }) // code: User.PlainPasswordTooLong

// Página de definir senha (cadastro) e de redefinir senha (recuperação).
export const newPasswordSchema = z
  .object({
    password: plainPasswordSchema,
    confirmPassword: z.string().min(1, { message: 'common:validation.confirmPassword.required' }),
  })
  // Cross-field: regra só de UI, sem equivalente no backend (o backend só recebe "password").
  .refine((data) => data.password === data.confirmPassword, {
    message: 'common:validation.confirmPassword.mismatch',
    path: ['confirmPassword'],
  })

export type NewPasswordFormValues = z.infer<typeof newPasswordSchema>
