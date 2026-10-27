export type ApiErrorType = 'Validation' | 'Conflict' | 'Unauthorized' | 'NotFound' | 'Failure'

export interface ApiError {
  code: string
  message: string
  type: ApiErrorType
  /** When the request sent a list and one item failed: its position (base 0). Absent for every other error. */
  index?: number
}

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value &&
    'type' in value
  )
}
