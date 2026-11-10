import { z } from 'zod'
import { userNameSchema } from '../../shared/validation/userFields'

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

// Só nome e e-mail: a senha é escolhida depois, na página aberta pelo link de confirmação (newPasswordSchema).
export const registerSchema = z.object({
  name: userNameSchema,
  email: emailSchema,
})

export type RegisterFormValues = z.infer<typeof registerSchema>

// "Esqueceu a senha?": só o e-mail.
export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

// Login NÃO passa pelo Email.Create no backend: AuthService/UserService.AuthenticateUser
// busca o e-mail diretamente no repositório, sem validar formato. Ainda assim, replicamos aqui
// a mesma regra de formato do registro (via emailSchema) por otimização de UX: um e-mail sem
// "@" nunca vai casar com nenhum usuário cadastrado, então vale rejeitar no client antes de
// gastar uma request.
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'common:validation.password.required' }),
})

export type LoginFormValues = z.infer<typeof loginSchema>
