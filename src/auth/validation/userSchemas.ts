import { z } from 'zod'

// Espelha LifeManager.Domain/Users/ValueObjects/UserName.cs (UserName.Create)
const userNameSchema = z
  .string()
  .trim()
  .min(1, { message: 'Nome é obrigatório' }) // code: User.UserNameIsNullOrWhiteSpace
  .max(100, { message: 'Nome não pode ter mais de 100 caracteres' }) // code: User.UserNameTooLong

// Espelha LifeManager.Domain/Users/ValueObjects/Email.cs (Email.Create)
// A regra do backend não é um regex de e-mail "de verdade": só exige presença de "@"
// que não esteja no início nem no fim da string. Reproduzida literalmente aqui,
// em vez de z.string().email() (que seria mais estrito que o backend e rejeitaria
// e-mails que o backend aceitaria).
const emailSchema = z
  .string()
  .trim()
  .min(1, { message: 'E-mail é obrigatório' }) // code: User.EmailIsNullOrWhiteSpace
  .refine((value) => value.includes('@') && !value.startsWith('@') && !value.endsWith('@'), {
    message: 'E-mail inválido', // code: User.EmailIsInvalid
  })

// Espelha LifeManager.Domain/Users/ValueObjects/PlainPassword.cs (PlainPassword.Create)
const plainPasswordSchema = z
  .string()
  .min(1, { message: 'Senha é obrigatória' }) // code: User.PlainPasswordIsNullOrWhiteSpace
  .min(8, { message: 'Senha deve ter no mínimo 8 caracteres' }) // code: User.PlainPasswordTooShort
  .max(50, { message: 'Senha não pode ter mais de 50 caracteres' }) // code: User.PlainPasswordTooLong

export const registerSchema = z
  .object({
    name: userNameSchema,
    email: emailSchema,
    password: plainPasswordSchema,
    confirmPassword: z.string().min(1, { message: 'Confirme sua senha' }),
  })
  // Cross-field: regra só de UI, sem equivalente no backend (o backend só recebe "password").
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
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
  password: z.string().min(1, { message: 'Senha é obrigatória' }),
})

export type LoginFormValues = z.infer<typeof loginSchema>
