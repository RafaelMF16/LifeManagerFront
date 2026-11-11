import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Dialog from '../../../shared/components/Dialog/Dialog'
import IconButton from '../../../shared/components/IconButton/IconButton'
import Input from '../../../shared/components/Input/Input'
import { useErrorModal } from '../../../shared/hooks/useErrorModal'
import { useToast } from '../../../shared/hooks/useToast'
import { useZodForm } from '../../../shared/hooks/useZodForm'
import { isSessionExpiredError } from '../../../shared/services/httpClient'
import { isApiError } from '../../../shared/types/ApiError'
import { applyApiErrorToForm } from '../../../shared/utils/applyApiErrorToForm'
import { changePassword } from '../../services/accountService'
import { TOO_MANY_REQUESTS_CODE, changePasswordErrorFieldMap } from '../../validation/accountErrorMap'
import { changePasswordSchema } from '../../validation/accountSchemas'

interface ChangePasswordDialogProps {
  onClose: () => void
}

const FALLBACKS: Record<string, string> = {
  [TOO_MANY_REQUESTS_CODE]: 'account:security.password.tooManyRequests',
}

/** Current password, new one and its confirmation; on success the other devices are signed out, this one stays. */
function ChangePasswordDialog({ onClose }: ChangePasswordDialogProps) {
  const { t: translate } = useTranslation(['account', 'common'])
  const titleId = useId()
  const { show: showToast } = useToast()
  const { show: showErrorModal } = useErrorModal()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useZodForm(changePasswordSchema, { defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' } })

  const submit = handleSubmit(async ({ currentPassword, newPassword }) => {
    try {
      await changePassword({ currentPassword, newPassword })
      showToast(translate('account:security.password.success'))
      onClose()
    } catch (err) {
      if (isSessionExpiredError(err)) return
      if (isApiError(err)) applyApiErrorToForm(err, setError, changePasswordErrorFieldMap, translate, FALLBACKS[err.code])
      else showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
    }
  })

  const errorOf = (message?: string) => (message ? translate(message) : undefined)

  return (
    <Dialog labelledBy={titleId} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="lm-dialog__header">
          <h2 id={titleId} className="lm-dialog__title">
            {translate('account:security.password.title')}
          </h2>
          <IconButton icon="x" size="sm" label={translate('account:actions.close')} onClick={onClose} />
        </div>

        <div className="lm-dialog__body">
          <div className="lm-account-form__fields">
            <Input
              type="password"
              label={translate('account:security.password.current')}
              autoComplete="current-password"
              autoFocus
              error={errorOf(errors.currentPassword?.message)}
              {...register('currentPassword')}
            />
            <Input
              type="password"
              label={translate('account:security.password.new')}
              hint={translate('account:security.password.newHint')}
              autoComplete="new-password"
              error={errorOf(errors.newPassword?.message)}
              {...register('newPassword')}
            />
            <Input
              type="password"
              label={translate('account:security.password.confirm')}
              autoComplete="new-password"
              error={errorOf(errors.confirmPassword?.message)}
              {...register('confirmPassword')}
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
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {translate('account:security.password.submit')}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export default ChangePasswordDialog
