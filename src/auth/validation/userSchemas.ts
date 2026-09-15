import { z } from 'zod'

// Espelha LifeManager.Domain/Users/ValueObjects/UserName.cs (UserName.Create)
const userNameSchema = z
  .string()
  .trim()
  .min(1, { message: 'auth:validation.name.required' }) // code: User.UserNameIsNullOrWhiteSpace
  .max(100, { message: 'auth:validation.name.tooLong' }) // code: User.UserNameTooLong

// Espelha LifeManager.Domain/Users/ValueObjects/Email.cs (Email.Create)
// Não é um regex de e-mail "de verdade" (não cobre todos os casos do RFC), mas exige
// o formato mínimo algo@algo.algo — mais do que só checar a presença de "@" (regra antiga),
// sem virar uma validação tão complexa a ponto de divergir do backend.
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

const emailSchema = z
  .string()
  .trim()
  .min(1, { message: 'auth:validation.email.required' }) // code: User.EmailIsNullOrWhiteSpace
  .refine((value) => EMAIL_PATTERN.test(value), {
    message: 'auth:validation.email.invalid', // code: User.EmailIsInvalid
  })

// Espelha LifeManager.Domain/Users/ValueObjects/PlainPassword.cs (PlainPassword.Create)
const plainPasswordSchema = z
  .string()
  .min(1, { message: 'auth:validation.password.required' }) // code: User.PlainPasswordIsNullOrWhiteSpace
  .min(8, { message: 'auth:validation.password.tooShort' }) // code: User.PlainPasswordTooShort
  .max(50, { message: 'auth:validation.password.tooLong' }) // code: User.PlainPasswordTooLong

export const registerSchema = z
  .object({
    name: userNameSchema,
    email: emailSchema,
    password: plainPasswordSchema,
    confirmPassword: z.string().min(1, { message: 'auth:validation.confirmPassword.required' }),
  })
  // Cross-field: regra só de UI, sem equivalente no backend (o backend só recebe "password").
  .refine((data) => data.password === data.confirmPassword, {
    message: 'auth:validation.confirmPassword.mismatch',
    path: ['confirmPassword'],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>

// Login NÃO passa pelo Email.Create no backend: AuthService/UserService.AuthenticateUser
// busca o e-mail diretamente no repositório, sem validar formato. Ainda assim, replicamos aqui
// a mesma regra de formato do registro (via emailSchema) por otimização de UX: um e-mail sem
// "@" nunca vai casar com nenhum usuário cadastrado, então vale rejeitar no client antes de
// gastar uma request.
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'auth:validation.password.required' }),
})

export type LoginFormValues = z.infer<typeof loginSchema>
