import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import type { ApiError } from '../types/ApiError'

export interface ApiErrorMapping<TFieldValues extends FieldValues> {
  field: Path<TFieldValues>
  message: string
}

/** Maps a backend `Error.code` to the form field it belongs to and the message to show for it. */
export type ApiErrorFieldMap<TFieldValues extends FieldValues> = Record<
  string,
  ApiErrorMapping<TFieldValues>
>

const DEFAULT_FALLBACK_MESSAGE = 'Não foi possível concluir. Tente novamente.'

/**
 * Applies a backend `ApiError` to a react-hook-form instance: sets the mapped field's error
 * when the error code is known, otherwise falls back to a form-level `root.serverError`.
 */
export function applyApiErrorToForm<TFieldValues extends FieldValues>(
  error: ApiError,
  setError: UseFormSetError<TFieldValues>,
  fieldMap: ApiErrorFieldMap<TFieldValues>,
  fallbackMessage: string = DEFAULT_FALLBACK_MESSAGE,
) {
  const mapping = fieldMap[error.code]

  if (mapping) {
    setError(mapping.field, { type: 'server', message: mapping.message })
    return
  }

  setError('root.serverError' as Path<TFieldValues>, {
    type: 'server',
    message: fallbackMessage,
  })
}
