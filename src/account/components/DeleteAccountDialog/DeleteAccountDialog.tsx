import { useId, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Button from '../../../shared/components/Button/Button'
import Dialog from '../../../shared/components/Dialog/Dialog'
import Input from '../../../shared/components/Input/Input'
import { useErrorModal } from '../../../shared/hooks/useErrorModal'
import { useToast } from '../../../shared/hooks/useToast'
import { useZodForm } from '../../../shared/hooks/useZodForm'
import { endLocalSession } from '../../../shared/services/authSession'
import { forgetPushOnThisDevice } from '../../../shared/services/pushService'
import { isSessionExpiredError } from '../../../shared/services/httpClient'
import { isApiError } from '../../../shared/types/ApiError'
import { applyApiErrorToForm } from '../../../shared/utils/applyApiErrorToForm'
import { requestAccountDeletion } from '../../services/accountService'
import { deletionDateLabel } from '../../utils/deletionDate'
import { TOO_MANY_REQUESTS_CODE, deleteAccountErrorFieldMap } from '../../validation/accountErrorMap'
import { deleteAccountSchema, deleteConfirmationWord, isDeleteConfirmed } from '../../validation/accountSchemas'
import './DeleteAccountDialog.css'

interface DeleteAccountDialogProps {
  onClose: () => void
}

const FALLBACKS: Record<string, string> = {
  [TOO_MANY_REQUESTS_CODE]: 'account:danger.dialog.tooManyRequests',
}

/**
 * Schedules the account's deletion: explains the 7 days of grace, then asks for the password and the language's
 * word (EXCLUIR / DELETE). The backend ends every session, so this tab goes back to the login.
 */
function DeleteAccountDialog({ onClose }: DeleteAccountDialogProps) {
  const { t: translate, i18n } = useTranslation(['account', 'common'])
  const titleId = useId()
  const navigate = useNavigate()
  const { show: showToast } = useToast()
  const { show: showErrorModal } = useErrorModal()
  const language = i18n.language
  const word = deleteConfirmationWord(language)
  const schema = useMemo(() => deleteAccountSchema(language), [language])

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useZodForm(schema, { defaultValues: { password: '', confirmation: '' } })
  const confirmed = isDeleteConfirmed(watch('confirmation'), language)

  const submit = handleSubmit(async ({ password }) => {
    let scheduledFor: string
    try {
      scheduledFor = (await requestAccountDeletion({ password })).scheduledFor
    } catch (err) {
      if (isSessionExpiredError(err)) return
      if (isApiError(err)) applyApiErrorToForm(err, setError, deleteAccountErrorFieldMap, translate, FALLBACKS[err.code])
      else showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
      return
    }

    // The backend already ended every session (and deleted the cookie): only this tab's state is left, plus this
    // device's reminders (the access token still works until it expires).
    await forgetPushOnThisDevice()
    endLocalSession()
    showToast(translate('account:danger.success', { date: deletionDateLabel(scheduledFor, language) }))
    navigate('/auth', { replace: true })
  })

  return (
    <Dialog role="alertdialog" labelledBy={titleId} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="lm-dialog__header">
          <h2 id={titleId} className="lm-dialog__title">
            {translate('account:danger.dialog.title')}
          </h2>
        </div>

        <div className="lm-dialog__body">
          <ul className="lm-delete-account__facts">
            <li>
              <strong>{translate('account:danger.dialog.grace')}</strong>
            </li>
            <li>{translate('account:danger.dialog.cancel')}</li>
            <li>{translate('account:danger.dialog.groups')}</li>
          </ul>

          <div className="lm-account-form__fields">
            <Input
              type="password"
              label={translate('account:danger.dialog.password')}
              autoComplete="current-password"
              error={errors.password?.message ? translate(errors.password.message) : undefined}
              {...register('password')}
            />
            <Input
              label={translate('account:danger.dialog.confirmation', { word })}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              error={errors.confirmation?.message ? translate(errors.confirmation.message, { word }) : undefined}
              {...register('confirmation')}
            />
          </div>

          {errors.root?.serverError?.message ? (
            <p className="lm-account-form__server-error" role="alert">
              {errors.root.serverError.message}
            </p>
          ) : null}
        </div>

        <div className="lm-dialog__footer">
          <Button variant="secondary" onClick={onClose}>
            {translate('account:actions.cancel')}
          </Button>
          <Button type="submit" variant="destructive" icon="trash-2" disabled={!confirmed} loading={isSubmitting}>
            {translate('account:danger.dialog.submit')}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export default DeleteAccountDialog
