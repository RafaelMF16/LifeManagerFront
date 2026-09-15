import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import type { ApiError } from '../types/ApiError'

export interface ApiErrorMapping<TFieldValues extends FieldValues> {
  field: Path<TFieldValues>
  message: string
}

/** Maps a backend `Error.code` to the form field it belongs to and the translation key to show for it. */
export type ApiErrorFieldMap<TFieldValues extends FieldValues> = Record<
  string,
  ApiErrorMapping<TFieldValues>
>

const DEFAULT_FALLBACK_MESSAGE_KEY = 'common:errors.generic'

/**
 * Applies a backend `ApiError` to a react-hook-form instance: sets the mapped field's error
 * when the error code is known, otherwise falls back to a form-level `root.serverError`.
 * `fieldMap` messages and `fallbackMessageKey` are i18next translation keys, translated via `translate`.
 */
export function applyApiErrorToForm<TFieldValues extends FieldValues>(
  error: ApiError,
  setError: UseFormSetError<TFieldValues>,
  fieldMap: ApiErrorFieldMap<TFieldValues>,
  translate: (key: string) => string,
  fallbackMessageKey: string = DEFAULT_FALLBACK_MESSAGE_KEY,
) {
  const mapping = fieldMap[error.code]

  if (mapping) {
    setError(mapping.field, { type: 'server', message: translate(mapping.message) })
    return
  }

  setError('root.serverError' as Path<TFieldValues>, {
    type: 'server',
    message: translate(fallbackMessageKey),
  })
}
