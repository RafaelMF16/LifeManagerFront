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

// Excluir a conta: a palavra que confirma muda com o idioma (EXCLUIR / DELETE); a senha o backend confere.
const DELETE_CONFIRMATION_WORDS: Record<string, string> = { 'pt-BR': 'EXCLUIR', 'en-US': 'DELETE' }

export function deleteConfirmationWord(language: string): string {
  return DELETE_CONFIRMATION_WORDS[language] ?? DELETE_CONFIRMATION_WORDS['pt-BR']
}

/** Whether what was typed is the language's word (spaces around and the case don't matter). */
export function isDeleteConfirmed(typed: string, language: string): boolean {
  return typed.trim().toUpperCase() === deleteConfirmationWord(language)
}

export function deleteAccountSchema(language: string) {
  return z.object({
    password: z.string().min(1, { message: 'account:danger.dialog.passwordRequired' }),
    confirmation: z.string().refine((typed) => isDeleteConfirmed(typed, language), {
      message: 'account:danger.dialog.confirmationMismatch',
    }),
  })
}

export type DeleteAccountFormValues = z.infer<ReturnType<typeof deleteAccountSchema>>
