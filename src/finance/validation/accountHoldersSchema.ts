import { z } from 'zod'

// Espelha LifeManager.Domain/AccountHolders. Only the obvious checks run here; the name-word count and the repeats
// are the backend's (it answers with the failing name's index), so the rule lives in one place.
export const ACCOUNT_HOLDERS_MAX = 5
export const ACCOUNT_HOLDER_NAME_MAX_LENGTH = 100

// The dialog stops adding names at ACCOUNT_HOLDERS_MAX, so the list itself needs no limit here.
export const accountHoldersSchema = z.object({
  holders: z.array(
    z.object({
      name: z
        .string()
        .trim()
        .min(1, { message: 'finance:accountHolders.validation.required' }) // code: AccountHolder.NameIsNullOrWhiteSpace
        .max(ACCOUNT_HOLDER_NAME_MAX_LENGTH, { message: 'finance:accountHolders.validation.tooLong' }), // code: AccountHolder.NameTooLong
    }),
  ),
})

export type AccountHoldersFormValues = z.infer<typeof accountHoldersSchema>
