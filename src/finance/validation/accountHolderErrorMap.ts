import type { ApiError } from '../../shared/types/ApiError'

// Espelha os códigos de LifeManager.Domain/AccountHolders/Errors/AccountHolderErrors.cs
/** Errors about one name: the backend sends its `index`, and the message goes under that field. */
const nameErrors: Record<string, string> = {
  'AccountHolder.NameIsNullOrWhiteSpace': 'finance:accountHolders.validation.required',
  'AccountHolder.NameTooLong': 'finance:accountHolders.validation.tooLong',
  'AccountHolder.NameTooShort': 'finance:accountHolders.validation.tooShort',
  'AccountHolder.DuplicateName': 'finance:accountHolders.validation.duplicate',
}

/** Errors about the whole list, shown above the buttons; any other code falls back to the generic message. */
const listErrors: Record<string, string> = {
  'AccountHolder.TooMany': 'finance:accountHolders.errors.tooMany',
}

export interface AccountHolderErrorTarget {
  /** The name the message goes under, or null for the whole list. */
  index: number | null
  /** Translation key. */
  message: string
}

export function resolveAccountHolderError(error: ApiError): AccountHolderErrorTarget {
  const nameMessage = nameErrors[error.code]
  if (nameMessage) return { index: error.index ?? null, message: nameMessage }

  return { index: null, message: listErrors[error.code] ?? 'common:errors.generic' }
}
