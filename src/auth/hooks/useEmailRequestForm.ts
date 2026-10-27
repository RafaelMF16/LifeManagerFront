import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { FieldValues } from 'react-hook-form'
import type { z } from 'zod'
import { useZodForm } from '../../shared/hooks/useZodForm'
import { useToast } from '../../shared/hooks/useToast'
import { useErrorModal } from '../../shared/hooks/useErrorModal'
import { applyApiErrorToForm } from '../../shared/utils/applyApiErrorToForm'
import type { ApiErrorFieldMap } from '../../shared/utils/applyApiErrorToForm'
import { isApiError } from '../../shared/types/ApiError'
import { authErrorMessageKey } from '../utils/authApiErrors'

/**
 * A form whose submit asks the backend to send an auth e-mail (the sign-up and "forgot password"). After a successful
 * submit `sent` holds what was sent, so the page can show "check your e-mail" instead of the form; `resend` asks again
 * with the same values and `changeEmail` goes back to the form, still filled.
 */
export function useEmailRequestForm<TSchema extends z.ZodType<FieldValues, FieldValues>>(
  schema: TSchema,
  request: (data: z.infer<TSchema>) => Promise<void>,
  errorFieldMap: ApiErrorFieldMap<z.infer<TSchema>>,
) {
  const { t: translate } = useTranslation(['auth', 'common'])
  const form = useZodForm(schema)
  const { show: showToast } = useToast()
  const { show: showErrorModal } = useErrorModal()
  const [sent, setSent] = useState<z.infer<TSchema> | null>(null)

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await request(data)
      setSent(data)
    } catch (err) {
      if (isApiError(err)) {
        applyApiErrorToForm(err, form.setError, errorFieldMap, translate, authErrorMessageKey(err))
      } else {
        showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
      }
    }
  })

  // Rejects after showing the error, so EmailSentNotice keeps its resend button unlocked.
  async function resend() {
    if (!sent) return
    try {
      await request(sent)
      showToast(translate('auth:emailSent.resentToast'))
    } catch (err) {
      if (isApiError(err)) {
        showErrorModal(translate('auth:emailSent.resendFailedTitle'), translate(authErrorMessageKey(err)))
      } else {
        showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
      }
      throw err
    }
  }

  return { form, sent, onSubmit, resend, changeEmail: () => setSent(null) }
}
