import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Dialog from '../../../shared/components/Dialog/Dialog'
import IconButton from '../../../shared/components/IconButton/IconButton'
import Input from '../../../shared/components/Input/Input'
import { useErrorModal } from '../../../shared/hooks/useErrorModal'
import { useToast } from '../../../shared/hooks/useToast'
import { useZodForm } from '../../../shared/hooks/useZodForm'
import { setCurrentUserName } from '../../../shared/services/currentUserStore'
import { isSessionExpiredError } from '../../../shared/services/httpClient'
import { isApiError } from '../../../shared/types/ApiError'
import { applyApiErrorToForm } from '../../../shared/utils/applyApiErrorToForm'
import { renameCurrentUser } from '../../services/accountService'
import { editNameErrorFieldMap } from '../../validation/accountErrorMap'
import { editNameSchema } from '../../validation/accountSchemas'

interface EditNameDialogProps {
  name: string
  onClose: () => void
}

/** Renames the user: the saved name shows at once in the Header, the Home and the habits' profile. */
function EditNameDialog({ name, onClose }: EditNameDialogProps) {
  const { t: translate } = useTranslation(['account', 'common'])
  const titleId = useId()
  const { show: showToast } = useToast()
  const { show: showErrorModal } = useErrorModal()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useZodForm(editNameSchema, { defaultValues: { name } })

  const submit = handleSubmit(async (values) => {
    try {
      const saved = await renameCurrentUser(values)
      setCurrentUserName(saved.name)
      showToast(translate('account:profile.edit.success'))
      onClose()
    } catch (err) {
      if (isSessionExpiredError(err)) return
      if (isApiError(err)) applyApiErrorToForm(err, setError, editNameErrorFieldMap, translate)
      else showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
    }
  })

  return (
    <Dialog labelledBy={titleId} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="lm-dialog__header">
          <h2 id={titleId} className="lm-dialog__title">
            {translate('account:profile.edit.title')}
          </h2>
          <IconButton icon="x" size="sm" label={translate('account:actions.close')} onClick={onClose} />
        </div>

        <div className="lm-dialog__body">
          <Input
            label={translate('account:profile.edit.label')}
            hint={translate('account:profile.edit.hint')}
            maxLength={100}
            autoComplete="name"
            autoFocus
            error={errors.name?.message ? translate(errors.name.message) : undefined}
            {...register('name')}
          />

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
            {translate('account:actions.save')}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export default EditNameDialog
